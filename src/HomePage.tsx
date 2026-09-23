import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
// The .webp files are 256px derivatives of the .png originals in the same
// folder, which are 1500-7898px square and were shipping 1.1 MB to render in a
// 72px box. Regenerate them from the PNGs if a client logo ever changes.
//
// Are Ye Dancin' needed one extra step. Its badge is gold line art on
// transparency, and .portfolio-logo puts a blue-to-teal gradient behind it, so
// at 72px the gold all but disappeared. It is composited onto a dark disc
// inset ~1.2% from the edge - just outside the badge's own gold ring - which
// gives the gold something to read against while still letting the gradient
// show at the corners, the way the other two logos do. The band's own
// solid-background variant works too but fills the tile edge to edge.
import areYeDancinLogo from '../logos/are-ye-dancin-logo.webp'
import blockchainTokenSniperLogo from '../logos/blockchain-token-sniper-logo.webp'
import healthOnWorkLogo from '../logos/health-on-work-logo.webp'
import logoAsset from '../logos/logo.svg'
import { Link } from 'react-router-dom'
import { additionalServiceIcons, serviceIcons } from './data/service-icons'
import { services as servicePages } from './data/services'
import { isWebKitConstrainedEnvironment } from './lib/env'

// These six links are the homepage's only path to the service pages, so their
// anchor text is the strongest internal ranking signal the site has. All six
// used to read "Learn more", which told Google nothing about where they went.
// The visible label is unchanged; the destination topic is appended in text
// that is clipped visually but present for crawlers and screen readers alike.
//
// schemaName is used rather than navLabel because it carries the commercial
// phrasing the target page is written for ("Web Application Development", not
// "Web Applications"). Deliberately no location term - per the keyword strategy
// in CLAUDE.md, the homepage stays broad and "[service] Dundee" targeting lives
// on the service pages themselves.
function ServiceCardLink({ title }: { title: string }) {
  const page = servicePages.find((servicePage) => servicePage.navLabel === title)
  if (!page) return null

  return (
    <Link className="service-card-link" to={`/services/${page.slug}`}>
      Learn more
      <span className="visually-hidden"> about {page.schemaName.toLowerCase()}</span>
    </Link>
  )
}

function HomePage() {
  const heroLogoScrollRef = useRef<HTMLDivElement | null>(null)
  const planetCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const contactDragonCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
    )
    const heroRevealElements = elements.filter((element) =>
      element.classList.contains('reveal-hero'),
    )
    const earlyRevealElements = elements.filter((element) =>
      element.classList.contains('reveal-early'),
    )
    const standardRevealElements = elements.filter(
      (element) =>
        !element.classList.contains('reveal-early') && !element.classList.contains('reveal-hero'),
    )
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const syncVisibility = (
      entry: IntersectionObserverEntry,
      showThreshold: number,
      hideThreshold: number,
    ) => {
      const element = entry.target as HTMLElement
      const isVisible = element.classList.contains('is-visible')
      const ratio = entry.intersectionRatio

      if (!isVisible && ratio >= showThreshold) {
        element.classList.add('is-visible')
      }

      if (isVisible && ratio <= hideThreshold) {
        element.classList.remove('is-visible')
      }
    }

    const updateScrollPosition = () => {
      const heroFadeProgress = Math.min(window.scrollY / 520, 1)

      root.style.setProperty('--hero-fade-progress', `${heroFadeProgress}`)
      root.style.setProperty('--scroll-y', `${window.scrollY}px`)
    }

    updateScrollPosition()

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          syncVisibility(entry, 0.18, 0.02)
        })
      },
      {
        threshold: [0, 0.02, 0.18],
        rootMargin: '0px 0px -6% 0px',
      },
    )

    const earlyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          syncVisibility(entry, 0.04, 0.01)
        })
      },
      {
        threshold: [0, 0.01, 0.04],
        rootMargin: '0px 0px 14% 0px',
      },
    )

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          syncVisibility(entry, 0.12, -1)
        })
      },
      {
        threshold: [0, 0.01, 0.12],
        rootMargin: '-82px 0px 0px 0px',
      },
    )

    standardRevealElements.forEach((element) => observer.observe(element))
    earlyRevealElements.forEach((element) => earlyObserver.observe(element))
    heroRevealElements.forEach((element) => heroObserver.observe(element))

    let previousScrollY = window.scrollY
    let previousFrameTime = performance.now()
    let smoothedDeltaTime = 1
    let scrollVelocity = 0
    let scrollAngle = 0
    let animationFrameId = 0
    let isAnimating = false

    const SCROLL_BOOST = 0.05
    const DAMPING = 0.76
    const MAX_VELOCITY = 10
    const RESTING_VELOCITY = 0.012

    let lastAppliedSpreadFactor = 0

    const stopScrollAnimation = () => {
      scrollVelocity = 0
      isAnimating = false
      root.style.setProperty('--particle-spread-factor', '0')
      lastAppliedSpreadFactor = 0
      animationFrameId = 0
    }

    const animate = (now: number) => {
      const rawDeltaTime = Math.min((now - previousFrameTime) / 16.6667, 3)
      previousFrameTime = now

      // Safari's rAF delivery is noisier than Chrome's - a raw frame-to-frame delta
      // feeds straight into rotation speed, so any timing hiccup between frames shows
      // up as a visible stutter once the spin has slowed down. Low-pass filtering it
      // means a single irregular frame doesn't produce a visible jump.
      smoothedDeltaTime += (rawDeltaTime - smoothedDeltaTime) * 0.35
      const deltaTime = smoothedDeltaTime

      scrollAngle += scrollVelocity * deltaTime
      scrollVelocity *= Math.pow(DAMPING, deltaTime)

      const velocityFactor = Math.abs(scrollVelocity) / MAX_VELOCITY

      // Writing this custom property retriggers keyframe interpolation on every
      // .hero-logo-fragment (they read it inside @keyframes particleDrift), which is
      // notably more expensive to recompute in Safari than Chrome - only write on
      // a meaningful change instead of every single rAF tick.
      if (Math.abs(velocityFactor - lastAppliedSpreadFactor) > 0.03) {
        root.style.setProperty('--particle-spread-factor', `${velocityFactor}`)
        lastAppliedSpreadFactor = velocityFactor
      }

      if (heroLogoScrollRef.current) {
        heroLogoScrollRef.current.style.transform = `rotate(${scrollAngle}deg)`
      }

      if (Math.abs(scrollVelocity) <= RESTING_VELOCITY) {
        stopScrollAnimation()
        return
      }

      animationFrameId = window.requestAnimationFrame(animate)
    }

    const startScrollAnimation = () => {
      if (isAnimating) {
        return
      }

      isAnimating = true
      previousFrameTime = performance.now()
      smoothedDeltaTime = 1
      animationFrameId = window.requestAnimationFrame(animate)
    }

    let scrollPositionUpdateQueued = false

    const onScroll = () => {
      if (!scrollPositionUpdateQueued) {
        scrollPositionUpdateQueued = true
        window.requestAnimationFrame(() => {
          updateScrollPosition()
          scrollPositionUpdateQueued = false
        })
      }

      const currentScrollY = window.scrollY
      const deltaY = currentScrollY - previousScrollY
      previousScrollY = currentScrollY

      scrollVelocity += deltaY * SCROLL_BOOST
      scrollVelocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, scrollVelocity))

      if (deltaY !== 0) {
        startScrollAnimation()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      earlyObserver.disconnect()
      heroObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const canvas = planetCanvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isReducedCapability = isWebKitConstrainedEnvironment()
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isReducedCapability ? 1.5 : 2)
    const rings = 15
    const pointsPerRing = 22
    const sphereRadius = 128
    let width = 0
    let height = 0
    let animationFrameId = 0
    let isInView = false

    type SpherePoint = {
      originX: number
      originY: number
      originZ: number
      ring: number
      position: number
    }

    type ProjectedPoint = SpherePoint & {
      x: number
      y: number
      z: number
      scale: number
      depth: number
    }

    const points: SpherePoint[] = []
    const glowGradientCache = new Map<string, CanvasGradient>()

    // Same story as the contact-page dragon canvas: building a fresh CanvasGradient per point
    // per frame was expensive enough to lag Safari, but the alpha-per-depth glow is most of the
    // sphere's shimmer. Cache gradients by a quantized (alpha, radius) bucket and draw each one
    // translated to the point's position instead of allocating one per point.
    const getGlowGradient = (alpha: number, radius: number) => {
      const alphaBucket = Math.round(alpha * 20) / 20
      const radiusBucket = Math.round(radius * 2) / 2
      const key = `${alphaBucket}-${radiusBucket}`
      const cached = glowGradientCache.get(key)

      if (cached) {
        return cached
      }

      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusBucket)
      gradient.addColorStop(0, `rgba(142, 245, 184, ${alphaBucket})`)
      gradient.addColorStop(1, 'rgba(142, 245, 184, 0)')
      glowGradientCache.set(key, gradient)
      return gradient
    }

    for (let ringIndex = 0; ringIndex < rings; ringIndex += 1) {
      const phi = (Math.PI / (rings + 1)) * (ringIndex + 1)

      for (let pointIndex = 0; pointIndex < pointsPerRing; pointIndex += 1) {
        const theta = ((Math.PI * 2) / pointsPerRing) * pointIndex

        points.push({
          originX: sphereRadius * Math.sin(phi) * Math.cos(theta),
          originY: sphereRadius * Math.sin(phi) * Math.sin(theta),
          originZ: sphereRadius * Math.cos(phi),
          ring: ringIndex,
          position: pointIndex,
        })
      }
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * devicePixelRatio)
      canvas.height = Math.floor(height * devicePixelRatio)
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const rotatePoint = (point: SpherePoint, angleX: number, angleY: number) => {
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const x1 = point.originX * cosY - point.originZ * sinY
      const z1 = point.originX * sinY + point.originZ * cosY
      const y1 = point.originY

      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const y2 = y1 * cosX - z1 * sinX
      const z2 = y1 * sinX + z1 * cosX

      return { x: x1, y: y2, z: z2 }
    }

    const projectPoint = (point: SpherePoint, time: number): ProjectedPoint => {
      const angleY = prefersReducedMotion ? 0.5 : time * 0.00034
      const angleX = prefersReducedMotion ? 0.18 : Math.sin(time * 0.00022) * 0.18 + 0.18
      const rotated = rotatePoint(point, angleX, angleY)
      const fov = 520
      const z = rotated.z + fov
      const scale = fov / z

      return {
        ...point,
        ...rotated,
        x: rotated.x * scale + width / 2,
        y: rotated.y * scale + height / 2,
        scale,
        depth: (rotated.z + sphereRadius) / (2 * sphereRadius),
      }
    }

    const draw = (time = 0) => {
      animationFrameId = window.requestAnimationFrame(draw)

      context.clearRect(0, 0, width, height)

      const projected = points.map((point) => projectPoint(point, time))

      for (let ringIndex = 0; ringIndex < rings; ringIndex += 1) {
        const ringPoints = projected.filter((point) => point.ring === ringIndex)

        ringPoints.forEach((point, index) => {
          const nextPoint = ringPoints[(index + 1) % ringPoints.length]
          const alpha = Math.min(point.depth, nextPoint.depth) * 0.36

          context.beginPath()
          context.moveTo(point.x, point.y)
          context.lineTo(nextPoint.x, nextPoint.y)
          context.strokeStyle = `rgba(142, 245, 184, ${alpha})`
          context.lineWidth = 0.65
          context.stroke()
        })
      }

      for (let pointIndex = 0; pointIndex < pointsPerRing; pointIndex += 2) {
        const meridian = projected
          .filter((point) => point.position === pointIndex)
          .sort((first, second) => first.ring - second.ring)

        for (let index = 0; index < meridian.length - 1; index += 1) {
          const point = meridian[index]
          const nextPoint = meridian[index + 1]
          const alpha = Math.min(point.depth, nextPoint.depth) * 0.24

          context.beginPath()
          context.moveTo(point.x, point.y)
          context.lineTo(nextPoint.x, nextPoint.y)
          context.strokeStyle = `rgba(35, 156, 119, ${alpha})`
          context.lineWidth = 0.55
          context.stroke()
        }
      }

      const glowDepthThreshold = isReducedCapability ? 0.4 : 0.06
      const glowRadiusMultiplier = isReducedCapability ? 1.6 : 3

      projected.forEach((point) => {
        if (point.depth < 0.06) {
          return
        }

        const radius = Math.max(1.2, point.scale * 2.4)
        const alpha = point.depth * 0.72

        // The gradient is only ever painted out to `radius` (not its own larger
        // extent) so just the dense, near-opaque center of the falloff shows through
        // as a soft edge - painting it out to its full extent (a past mistake) turns
        // every point into a much bigger, heavily overlapping blur.
        if (point.depth > glowDepthThreshold) {
          const glowRadius = radius * glowRadiusMultiplier
          const gradient = getGlowGradient(alpha, glowRadius)

          context.save()
          context.translate(point.x, point.y)
          context.fillStyle = gradient
          context.beginPath()
          context.arc(0, 0, radius, 0, Math.PI * 2)
          context.fill()
          context.restore()
        } else {
          context.beginPath()
          context.arc(point.x, point.y, radius, 0, Math.PI * 2)
          context.fillStyle = `rgba(142, 245, 184, ${alpha})`
          context.fill()
        }
      })
    }

    const stopAnimation = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
        animationFrameId = 0
      }
    }

    const startAnimation = () => {
      if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(draw)
      }
    }

    const syncRunState = () => {
      if (isInView && !document.hidden) {
        startAnimation()
      } else {
        stopAnimation()
      }
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting
        syncRunState()
      },
      { threshold: 0 },
    )

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    document.addEventListener('visibilitychange', syncRunState)
    intersectionObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', syncRunState)
      intersectionObserver.disconnect()
      stopAnimation()
    }
  }, [])

  useEffect(() => {
    const canvas = contactDragonCanvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    type DragonPoint = {
      x: number
      y: number
      z: number
      size: number
      phase: number
      accent: number
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isReducedCapability = isWebKitConstrainedEnvironment()
    // This canvas is small (~full-width × 300px), in-view-gated, and paused off-screen, so
    // unlike the full-viewport background particle network it can afford a denser backing
    // store. Capping at 1.5 on iPhones (native DPR 3) forced a 2× display upscale that read
    // as blurry dots - 2 keeps the dragon sharp while staying well under native cost.
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    // Painting a gradient-filled glow behind every qualifying point is a real per-pixel
    // rasterization cost, not just a JS allocation cost - caching the gradient object
    // (below) doesn't reduce it. The denser buffer above raises that per-glow paint cost
    // (~1.8× the pixels), so trim the glow radius on Safari/iOS to keep it roughly flat.
    // Idle (non-dragged) rotation only ever pushes point depth to ~0.62 at its extreme
    // (see idleRotationX/Y above) - a threshold at or above that never fires without the
    // visitor actively dragging the logo, killing the shimmer by default. Keep it inside
    // the idle range so it still breathes at rest, just with a smaller/cheaper glow.
    const glowDepthThreshold = isReducedCapability ? 0.5 : 0.48
    const glowRadiusMultiplier = isReducedCapability ? 1.7 : 3.2
    const image = new Image()
    const points: DragonPoint[] = []
    const glowGradientCache = new Map<string, CanvasGradient>()

    // Building a fresh CanvasGradient per point (up to ~500/frame) was expensive enough on
    // Safari to cause visible lag, but it's also what carries the shimmer effect (the glow's
    // alpha pulses with the point, which reads far more visibly than the tiny dot alone).
    // Cache gradients by a quantized (color, alpha, radius) bucket instead of by point, then
    // draw each one translated to the point's position - full shimmer, a handful of allocations.
    const getGlowGradient = (colorIndex: number, alpha: number, radius: number) => {
      const alphaBucket = Math.round(alpha * 20) / 20
      const radiusBucket = Math.round(radius * 2) / 2
      const key = `${colorIndex}-${alphaBucket}-${radiusBucket}`
      const cached = glowGradientCache.get(key)

      if (cached) {
        return cached
      }

      const colorBase =
        colorIndex === 2 ? '142, 245, 184' : colorIndex === 1 ? '56, 199, 147' : '244, 244, 238'
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusBucket)
      gradient.addColorStop(0, `rgba(${colorBase}, ${alphaBucket})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      glowGradientCache.set(key, gradient)
      return gradient
    }
    let width = 0
    let height = 0
    let animationFrameId = 0
    let isInView = false
    let dragRotationX = 0
    let dragRotationY = 0
    let velocityX = 0
    let velocityY = 0
    let isDragging = false
    let activePointerId: number | null = null
    let lastX = 0
    let lastY = 0
    let isReady = false
    let isCancelled = false

    const seededNoise = (value: number) => {
      const x = Math.sin(value * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * devicePixelRatio)
      canvas.height = Math.floor(height * devicePixelRatio)
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const sampleLogo = () => {
      const sampleSize = 220
      const offscreen = document.createElement('canvas')
      const offscreenContext = offscreen.getContext('2d')

      if (!offscreenContext) {
        return
      }

      offscreen.width = sampleSize
      offscreen.height = sampleSize
      offscreenContext.clearRect(0, 0, sampleSize, sampleSize)
      offscreenContext.drawImage(image, 0, 0, sampleSize, sampleSize)

      const imageData = offscreenContext.getImageData(0, 0, sampleSize, sampleSize)
      const candidates: DragonPoint[] = []
      const stride = 3

      for (let y = 0; y < sampleSize; y += stride) {
        for (let x = 0; x < sampleSize; x += stride) {
          const alpha = imageData.data[(y * sampleSize + x) * 4 + 3]

          if (alpha < 80) {
            continue
          }

          const normalizedX = (x / sampleSize - 0.5) * 2
          const normalizedY = (0.5 - y / sampleSize) * 2
          const noise = seededNoise(x * 97 + y * 31)

          candidates.push({
            x: normalizedX,
            y: normalizedY,
            z: (noise - 0.5) * 0.1,
            size: 0.72 + seededNoise(x * 13 + y * 17) * 0.82,
            phase: seededNoise(x * 19 + y * 23) * Math.PI * 2,
            accent: seededNoise(x * 29 + y * 37),
          })
        }
      }

      const bounds = candidates.reduce(
        (current, point) => ({
          minX: Math.min(current.minX, point.x),
          maxX: Math.max(current.maxX, point.x),
          minY: Math.min(current.minY, point.y),
          maxY: Math.max(current.maxY, point.y),
        }),
        {
          minX: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        },
      )
      const centerX = (bounds.minX + bounds.maxX) / 2
      const centerY = (bounds.minY + bounds.maxY) / 2
      const logoRange = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)
      const logoScale = logoRange > 0 ? 1.62 / logoRange : 1

      candidates.forEach((point) => {
        point.x = (point.x - centerX) * logoScale
        point.y = (centerY - point.y) * logoScale
      })

      const maxPoints = isReducedCapability ? 560 : 1040
      const step = Math.max(1, Math.ceil(candidates.length / maxPoints))
      points.length = 0
      points.push(...candidates.filter((_, index) => index % step === 0).slice(0, maxPoints))
      isReady = points.length > 0
    }

    // The logo is draggable but always returns to its rest pose. This runs on every
    // frame the visitor is not actively dragging, including under prefers-reduced-motion:
    // skipping it there left a released dragon frozen at whatever angle it was let go at.
    const settleTowardsRest = () => {
      dragRotationX += velocityX
      dragRotationY += velocityY
      velocityX *= 0.92
      velocityY *= 0.92
      dragRotationX *= 0.985
      dragRotationY *= 0.985

      // Exponential decay approaches zero without ever arriving, so it would keep a
      // permanent sub-degree tilt. Snap once the remainder is far below one pixel of
      // travel, which is also what lets the rest pose be genuinely identical every time.
      if (Math.abs(velocityX) < 0.00001) {
        velocityX = 0
      }

      if (Math.abs(velocityY) < 0.00001) {
        velocityY = 0
      }

      if (velocityX === 0 && Math.abs(dragRotationX) < 0.0001) {
        dragRotationX = 0
      }

      if (velocityY === 0 && Math.abs(dragRotationY) < 0.0001) {
        dragRotationY = 0
      }
    }

    const rotatePoint = (point: DragonPoint, time: number) => {
      const idleRotationX = prefersReducedMotion ? 0 : Math.sin(time * 0.00078) * 0.052
      const idleRotationY = prefersReducedMotion ? 0 : Math.sin(time * 0.00052) * 0.115
      const idleRotationZ = prefersReducedMotion ? 0 : Math.sin(time * 0.00043 + 1.4) * 0.028
      const rotationX = idleRotationX + dragRotationX
      const rotationY = idleRotationY + dragRotationY
      const cosY = Math.cos(rotationY)
      const sinY = Math.sin(rotationY)
      const x1 = point.x * cosY - point.z * sinY
      const z1 = point.x * sinY + point.z * cosY

      const cosX = Math.cos(rotationX)
      const sinX = Math.sin(rotationX)
      const y2 = point.y * cosX - z1 * sinX
      const z2 = point.y * sinX + z1 * cosX

      const cosZ = Math.cos(idleRotationZ)
      const sinZ = Math.sin(idleRotationZ)

      return {
        x: x1 * cosZ - y2 * sinZ,
        y: x1 * sinZ + y2 * cosZ,
        z: z2,
      }
    }

    const draw = (time = 0) => {
      animationFrameId = window.requestAnimationFrame(draw)

      if (!isReady) {
        return
      }

      context.clearRect(0, 0, width, height)

      if (!isDragging) {
        settleTowardsRest()
      }

      const scaleBase = Math.min(width, height) * 0.56
      const projected = points
        .map((point) => {
          const rotated = rotatePoint(point, time)
          const perspective = 1.85 / (2.5 + rotated.z)
          return {
            ...point,
            px: rotated.x * scaleBase * perspective + width / 2,
            py: rotated.y * scaleBase * perspective + height / 2,
            depth: Math.max(0, Math.min(1, (rotated.z + 0.68) / 1.36)),
            perspective,
          }
        })
        .sort((first, second) => first.depth - second.depth)

      const glow = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, scaleBase * 1.2)
      glow.addColorStop(0, 'rgba(56, 199, 147, 0.09)')
      glow.addColorStop(0.55, 'rgba(142, 245, 184, 0.026)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      for (let index = 0; index < projected.length; index += 6) {
        const point = projected[index]
        const nextPoint = projected[index + 1]

        if (!nextPoint) {
          continue
        }

        const distance = Math.hypot(point.px - nextPoint.px, point.py - nextPoint.py)

        if (distance > 22) {
          continue
        }

        context.beginPath()
        context.moveTo(point.px, point.py)
        context.lineTo(nextPoint.px, nextPoint.py)
        context.strokeStyle = `rgba(56, 199, 147, ${(1 - distance / 22) * 0.08})`
        context.lineWidth = 0.45
        context.stroke()
      }

      projected.forEach((point) => {
        const shimmer = 0.92 + Math.sin(time * 0.002 + point.phase) * 0.08
        const radius = Math.max(0.62, point.size * point.perspective * (0.92 + point.depth * 0.28))
        const alpha = (0.62 + point.depth * 0.34) * shimmer
        const color =
          point.accent > 0.82
            ? `rgba(142, 245, 184, ${alpha})`
            : point.accent > 0.5
              ? `rgba(56, 199, 147, ${alpha})`
              : `rgba(244, 244, 238, ${alpha})`

        if (point.depth > glowDepthThreshold) {
          const colorIndex = point.accent > 0.82 ? 2 : point.accent > 0.5 ? 1 : 0
          const glowRadius = radius * glowRadiusMultiplier
          const pointGlow = getGlowGradient(colorIndex, alpha, glowRadius)

          context.save()
          context.translate(point.px, point.py)
          context.fillStyle = pointGlow
          context.beginPath()
          context.arc(0, 0, glowRadius, 0, Math.PI * 2)
          context.fill()
          context.restore()
        }

        context.beginPath()
        context.arc(point.px, point.py, radius, 0, Math.PI * 2)
        context.fillStyle = color
        context.fill()
      })
    }

    // Every way a drag can end has to be covered, because a drag that never ends is not
    // merely stuck: onPointerMove gates on isDragging alone, so a latched flag turns a
    // plain hover into a drag and permanently suppresses settleTowardsRest. The releases
    // the canvas alone does not see include a right-click or two-finger tap raising the
    // context menu, a pointer released after the window loses focus, and a capture the
    // browser hands back early. Hence window-level listeners plus lostpointercapture.
    const endDrag = (event?: PointerEvent) => {
      if (!isDragging || (event && event.pointerId !== activePointerId)) {
        return
      }

      isDragging = false

      if (activePointerId !== null && canvas.hasPointerCapture(activePointerId)) {
        canvas.releasePointerCapture(activePointerId)
      }

      activePointerId = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', onWindowBlur)

      if (prefersReducedMotion) {
        velocityX = 0
        velocityY = 0
      }
    }

    const onWindowBlur = () => {
      endDrag()
    }

    const onPointerDown = (event: PointerEvent) => {
      // Secondary and middle presses cannot produce a useful drag and are the ones whose
      // release most often goes missing, and a second finger arriving mid-drag would fight
      // the first for lastX/lastY. Take primary presses only, one at a time.
      if (isDragging || !event.isPrimary || event.button !== 0) {
        return
      }

      isDragging = true
      activePointerId = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      velocityX = 0
      velocityY = 0

      try {
        canvas.setPointerCapture(event.pointerId)
      } catch {
        // Capture is refused if the pointer has already gone away. The window listeners
        // below still deliver the move and release, so the drag works either way.
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', endDrag)
      window.addEventListener('pointercancel', endDrag)
      window.addEventListener('blur', onWindowBlur)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== activePointerId) {
        return
      }

      const deltaX = event.clientX - lastX
      const deltaY = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      velocityX = deltaY * 0.003
      velocityY = deltaX * 0.003
      dragRotationX += velocityX
      dragRotationY += velocityY
    }

    const onLostPointerCapture = (event: PointerEvent) => {
      endDrag(event)
    }

    const stopAnimation = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
        animationFrameId = 0
      }
    }

    const startAnimation = () => {
      if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(draw)
      }
    }

    const syncRunState = () => {
      if (isInView && !document.hidden) {
        startAnimation()
      } else {
        // Nothing settles while the loop is parked, so a drag still in progress here
        // would be held at its current angle until the canvas came back into view.
        endDrag()
        stopAnimation()
      }
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting
        syncRunState()
      },
      { threshold: 0 },
    )

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    document.addEventListener('visibilitychange', syncRunState)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('lostpointercapture', onLostPointerCapture)
    intersectionObserver.observe(canvas)

    image.onload = () => {
      if (isCancelled) {
        return
      }

      sampleLogo()
    }
    image.src = logoAsset

    return () => {
      isCancelled = true
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', syncRunState)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('lostpointercapture', onLostPointerCapture)
      // Drops the window-level drag listeners too, if a drag is still open.
      endDrag()
      intersectionObserver.disconnect()
      stopAnimation()
    }
  }, [])

  const services = useMemo(
    () => [
      {
    number: '01',
    title: 'Websites & E-commerce',
    description:
      'Professional business websites, brochure sites, landing pages and e-commerce stores designed to help your business grow.',
  },
  {
    number: '02',
    title: 'Web Applications',
    description:
      'Custom browser-based software, booking systems, customer portals, dashboards, admin panels and other web-based platforms.',
  },
  {
    number: '03',
    title: 'Mobile Apps',
    description:
      'Custom iPhone and Android applications built for customers, staff and internal business use.',
  },
  {
    number: '04',
    title: 'Desktop Software',
    description:
      'Windows and cross-platform desktop applications built around specialist business requirements and internal operations.',
  },
  {
    number: '05',
    title: 'Automation & Tools',
    description:
      'Software that automates processes, integrates with existing systems and provides custom tools tailored to your business.',
  },
  {
    number: '06',
    title: 'Bespoke Software',
    description:
      "Custom software designed around your exact requirements when off-the-shelf solutions aren't suitable.",
  },
    ],
    [],
  )

  const additionalServices = useMemo(
    () => [
      {
        title: 'SEO & Google Ads Management',
        description:
          'Technical and on-page SEO combined with targeted Google Ads campaigns, complete with conversion tracking and clear performance reporting, to improve visibility, attract relevant visitors and generate more enquiries.',
      },
      {
        title: 'Software Consultancy',
        description:
          'Practical guidance on software, systems, automation and digital strategy to help businesses choose the right technology and avoid costly mistakes.',
      },
      {
        title: 'Software Support & Maintenance',
        description:
          'Ongoing updates, security monitoring, backups, hosting support and technical maintenance to keep your software and websites running reliably.',
      },
    ],
    [],
  )

  const commonSolutions = useMemo(
    () => [
      'Business Websites',
      'Landing Pages',
      'E-Commerce Websites',
      'Booking Systems',
      'Customer Portals',
      'Internal Business Software',
      'Staff Scheduling Systems',
      'CRM Platforms',
      'Dashboards & Reporting',
      'Mobile Applications',
      'Automation Tools',
      'API Integrations',
    ],
    [],
  )

  const portfolio = useMemo(
    () => [
      {
        badge: 'Web Application',
        title: 'HealthOnWork',
        subtitle: 'Occupational health and workplace wellbeing reports',
        description:
          'Designed and developed a modern digital platform for an occupational health provider, combining lead generation, client onboarding and online assessment workflows. The platform streamlines the collection of assessment information, supports report generation and provides a professional digital experience for employers, employees and practitioners.',
        logo: healthOnWorkLogo,
        metrics: [],
        link: 'https://healthonwork.com',
        linkLabel: 'Visit healthonwork.com',
      },
      {
        badge: 'Bespoke software',
        title: 'BlockchainTokenSniper',
        subtitle: 'Automated cryptocurrency trading and portfolio management',
        description:
          'A cloud-hosted trading platform enabling users to buy, sell and monitor cryptocurrency assets across multiple blockchain networks through an intuitive Telegram interface. Features included automated trade execution, wallet management, subscription billing, referrals and real-time transaction monitoring.',
        logo: blockchainTokenSniperLogo,
        metrics: [],
        link: null,
        linkLabel: null,
      },
      {
        badge: 'Website and booking system',
        title: "Are Ye Dancin'",
        subtitle: 'Ceilidh band and DJ act, Perth',
        description:
          'A public booking site backed by a private admin system for managing the diary end to end. Customers check a date and enquire online; the owner reviews and confirms enquiries from a secure admin area, raises Stripe deposit invoices, and has confirmed bookings written straight into his own Google Calendar so the site can never double-book a date. Bookings and enquiries stored in a serverless database.',
        logo: areYeDancinLogo,
        metrics: [],
        link: 'https://areyedancin.co.uk',
        linkLabel: 'Visit areyedancin.co.uk',
      },
    ],
    [],
  )

  // const whyChooseUs = useMemo(
  //   () => [
  //     'Bespoke development tailored to your exact requirements',
  //     'Modern, premium user interface design',
  //     'Strong technical range across customer-facing and operational software',
  //     'Clear communication throughout the project',
  //     'Built for usability, performance, and long-term maintainability',
  //     'Suitable for both straightforward business sites and specialised systems',
  //     'Flexible enough to support everything from small launches to advanced platforms',
  //   ],
  //   [],
  // )

  const processSteps = useMemo(
    () => [
      {
        step: '01',
        title: 'Initial Discussion',
        body: 'We start with a free no-obligation voice or video call to understand your requirements, your business, and the problems the software needs to solve.',
      },
      {
        step: '02',
        title: 'Planning and Scope',
        body: 'We outline the recommended solution, the likely structure, key features, and a clear direction before development begins.',
      },
      {
        step: '03',
        title: 'Design and Development',
        body: 'The product is designed and built with a focus on performance, clarity, usability, clean engineering, and a polished finish.',
      },
      {
        step: '04',
        title: 'Review and Refinement',
        body: 'You review progress, provide feedback, and we refine the solution so it fits your needs properly and works in practice.',
      },
      {
        step: '05',
        title: 'Launch and Ongoing Support',
        body: 'Once ready, the project can be deployed and developed further over time as your business evolves.',
      },
    ],
    [],
  )

  const heroLogoFragments = useMemo(
    () => {
      const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min
      const particleAmount = 14

      return Array.from({ length: particleAmount }, (_, index) => ({
        id: index,
        angle: (360 / particleAmount) * index,
        burstAngle: randomBetween(0, 360),
        baseDistance: randomBetween(118, 198),
        distanceBoost: randomBetween(16, 38),
        flingDistance: randomBetween(82, 150),
        size: randomBetween(2.5, 6.5),
        stretch: randomBetween(0.8, 1.45),
        opacity: randomBetween(0.16, 0.38),
        delay: -randomBetween(0, 8),
        duration: randomBetween(7.5, 12.5),
      }))
    },
    [],
  )

  const formDefaults = {
    name: '',
    email: '',
    phone: '',
    company: '',
    details: '',
    website: '',
  }

  const [formData, setFormData] = useState(formDefaults)
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.details.trim()) {
      setFormState('error')
      setFormMessage('Please complete your name, email address, and project details.')
      return
    }

    setFormState('loading')
    setFormMessage('Sending your enquiry...')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? ((await response.json()) as { message?: string })
        : {
            message:
              'The contact form backend is not available on this hosting setup. Please email contact@hydradigital.co.uk directly.',
          }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send your enquiry right now.')
      }

      setFormState('success')
      setFormMessage(data.message || 'Thanks - your enquiry has been sent successfully.')
      setFormData(formDefaults)
    } catch (error) {
      setFormState('error')
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while sending your enquiry.',
      )
    }
  }

  return (
      <main>
        <section className="hero-section">
          <div className="container hero-shell">
            <div className="hero-grid hero-grid-top">
              <div className="hero-copy hero-copy-top reveal-on-scroll reveal-rise reveal-hero">
                <h1>Custom software solutions engineered for real business use.</h1>
              </div>

              <aside
                className="hero-panel-top reveal-on-scroll reveal-zoom delay-1 reveal-hero"
                aria-label="Hydra Digital logo showcase"
              >
                <div className="panel-glow" />
                <div className="hero-logo-stage hero-logo-stage-large" aria-hidden="true">
                  <div className="hero-orb">
                    <span className="orb-ring" />
                    <span className="orb-ring" />
                    <span className="orb-ring" />
                    <span className="orb-glow" />
                  </div>
                  <div className="hero-logo-halo hero-logo-halo-primary" />
                  <div className="hero-logo-halo hero-logo-halo-secondary" />
                  <div className="hero-logo-fragments">
                    {heroLogoFragments.map((fragment) => (
                      <span
                        className="hero-logo-fragment"
                        key={fragment.id}
                        style={
                          {
                            '--fragment-angle': `${fragment.angle}deg`,
                            '--fragment-burst-angle': `${fragment.burstAngle}deg`,
                            '--fragment-base-distance': `${fragment.baseDistance}px`,
                            '--fragment-distance-boost': `${fragment.distanceBoost}px`,
                            '--fragment-fling-distance': `${fragment.flingDistance}px`,
                            '--fragment-size': `${fragment.size}px`,
                            '--fragment-stretch': fragment.stretch,
                            '--fragment-opacity': fragment.opacity,
                            '--fragment-delay': `${fragment.delay}s`,
                            '--fragment-duration': `${fragment.duration}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <div className="hero-logo-shell">
                    <div className="hero-logo-core hero-logo-core-large">
                      <div className="hero-logo-idle-rotator hero-logo-idle-rotator-large">
                        <div
                          className="hero-logo-scroll-rotator hero-logo-scroll-rotator-large"
                          ref={heroLogoScrollRef}
                        >
                          <img
                            className="hero-logo-image hero-logo-image-large"
                            src={logoAsset}
                            alt="Hydra Digital logo"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="hero-detail reveal-on-scroll reveal-rise reveal-hero">
              <p className="hero-lead">
                Hydra Digital is a Dundee-based software company. We design and build
                tailored software for businesses that want to improve operations, work more
                efficiently, and grow with systems that are properly thought through.
              </p>
              <p className="hero-lead">
                We focus on clear thinking, dependable engineering, and polished delivery.
                Every project is shaped around the way your business actually works, with an
                emphasis on usability, reliability, and long-term value.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#contact">
                  Book a Free Consultation
                </a>
                <a className="button button-secondary" href="#services">
                  View Services
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" id="services">
          <div className="container">
            <div className="section-intro section-intro-with-planet">
              <div className="section-heading reveal-on-scroll reveal-rise reveal-early">
                <span className="eyebrow">What We Offer</span>
                <h2>Websites, apps, automation and custom software</h2>
                <p>
                  We build practical software for businesses, from public-facing websites to
                  internal systems, mobile apps, automation tools and more.
                </p>
              </div>

              <div
                className="services-planet reveal-on-scroll reveal-zoom reveal-early delay-1"
                aria-hidden="true"
              >
                <canvas className="planet-canvas" ref={planetCanvasRef} />
              </div>
            </div>

            <div className="card-grid services-grid">
              {services.map((service, index) => (
                <article
                  className={`surface-card service-card reveal-on-scroll ${
                    index % 3 === 0
                      ? 'reveal-left'
                      : index % 3 === 1
                        ? 'reveal-rise'
                        : 'reveal-right'
                  } ${index < 3 ? 'reveal-early' : ''}`}
                  key={service.title}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <span className="service-icon" aria-hidden="true">
                    {serviceIcons[index]}
                  </span>
                  <span className="card-number">{service.number}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ServiceCardLink title={service.title} />
                </article>
              ))}
            </div>

            <p className="section-footnote">
              If your requirements are unusual or highly specific, that is not a problem. We
              regularly work on bespoke builds that do not fit neatly into an off-the-shelf category.
            </p>

            <span className="eyebrow additional-services-label reveal-on-scroll reveal-rise">
              Additional Business Services
            </span>

            <div className="card-grid mini-service-grid">
              {additionalServices.map((service, index) => (
                <article
                  className={`surface-card mini-service-card reveal-on-scroll ${
                    index % 3 === 0
                      ? 'reveal-left'
                      : index % 3 === 1
                        ? 'reveal-rise'
                        : 'reveal-right'
                  }`}
                  key={service.title}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <span className="service-icon" aria-hidden="true">
                    {additionalServiceIcons[index]}
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ServiceCardLink title={service.title} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section soft-section" id="solutions">
          <div className="container">
            <div className="section-heading reveal-on-scroll reveal-rise">
              <span className="eyebrow">Common Solutions We Build</span>
              <h2>Software and digital systems built around your business</h2>
              <p>
                These are the types of systems businesses often ask us to design, build and
                improve.
              </p>
            </div>

            <div className="solution-grid">
              {commonSolutions.map((solution, index) => (
                <article
                  className={`solution-card reveal-on-scroll ${
                    index % 2 === 0 ? 'reveal-left' : 'reveal-right'
                  }`}
                  key={solution}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <span className="solution-dot" />
                  <span>{solution}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section" id="work">
          <div className="container">
            <div className="section-heading reveal-on-scroll reveal-rise">
              <span className="eyebrow">Selected Work</span>
              <h2>A snapshot of what we've built</h2>
              <p>
                A selection of projects showcasing the range of software, platforms and digital products we design and develop.
              </p>
            </div>

            <div className="portfolio-grid">
              {portfolio.map((item, index) => (
                <article
                  className={`surface-card portfolio-card ${index === 0 ? 'portfolio-featured reveal-zoom' : index % 2 === 0 ? 'reveal-right' : 'reveal-left'} reveal-on-scroll`}
                  key={`${item.title}-${index}`}
                >
                  <div className="portfolio-logo" aria-hidden="true">
                    <img src={item.logo} alt="" width="256" height="256" loading="lazy" decoding="async" />
                  </div>
                  <span className="portfolio-badge">{item.badge}</span>
                  <h3>{item.title}</h3>
                  <p className="portfolio-subtitle">{item.subtitle}</p>
                  <p>{item.description}</p>
                  <ul className="metric-list">
                    {item.metrics.map((metric) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                  {item.link ? (
                    <a className="text-link" href={item.link} target="_blank" rel="noreferrer">
                      {item.linkLabel}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* <section className="content-section" id="why-us">
          <div className="container split-section">
            <div className="section-heading reveal-on-scroll reveal-rise">
              <span className="eyebrow">Why Businesses Work With Hydra Digital</span>
              <h2>Practical software thinking with strong technical depth</h2>
              <p>
                We focus on practical software that actually solves problems. That means
                understanding how the business operates, identifying what needs improved,
                and building a solution that is clean, efficient, and commercially useful.
              </p>
            </div>

            <div className="why-grid">
              {whyChooseUs.map((item, index) => (
                <article
                  className={`why-card reveal-on-scroll ${
                    index % 2 === 0 ? 'reveal-left' : 'reveal-right'
                  }`}
                  key={item}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="check-mark">+</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section> */}

        <section className="content-section soft-section" id="process">
          <div className="container">
            <div className="section-heading reveal-on-scroll reveal-rise">
              <span className="eyebrow">How It Works</span>
              <h2>A straightforward process from brief to launch</h2>
              <p>
                The aim is to make software projects clearer, calmer, and easier to move forward with.
              </p>
            </div>

            <div className="process-grid">
              {processSteps.map((step, index) => (
                <article
                  className={`surface-card process-card reveal-on-scroll ${
                    index % 2 === 0 ? 'reveal-rise' : 'reveal-zoom'
                  }`}
                  key={step.step}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <span className="process-step">Step {step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section" id="about">
          <div className="container about-grid">
            <div className="section-heading reveal-on-scroll reveal-left">
              <span className="eyebrow">About Hydra Digital</span>
              <h2>Software built around real business requirements</h2>
              <p>
                Hydra Digital is a modern software development company based in Dundee, Scotland,
                focused on building tailored digital solutions for businesses. We design and develop websites, applications, 
                automation tools and custom software systems that are built around real operational requirements.
              </p>
              <p>
                Our approach combines strong technical capability 
                with a practical understanding of how software 
                should support day-to-day business operations.
              </p>
              <p>
                Whether it's a customer-facing website, a booking platform, an 
                internal business system or a specialist software project, the 
                goal remains the same: to deliver software that is reliable, 
                maintainable and genuinely useful.
              </p>
            </div>

            <aside className="surface-card founder-card reveal-on-scroll reveal-right delay-2">
              <span className="eyebrow">Founder &amp; Lead Software Engineer</span>
              <h3>James McFadyen</h3>
              <p>
               Hydra Digital was founded by James McFadyen, a software engineer and University of Glasgow graduate 
               with over a decade of hands-on programming experience including websites, web apps, 
               mobile apps, automation tools, desktop software, scripts, blockchain applications and specialist software projects.
              </p>
            </aside>
          </div>
        </section>

        {/* <section className="cta-section">
          <div className="container cta-panel reveal-on-scroll reveal-zoom">
            <div>
              <span className="eyebrow eyebrow-on-dark">Let’s Discuss Your Project</span>
              <h2>Whether you need a new digital platform, an internal system, or something more specialised, we would be happy to discuss it.</h2>
              <p className="cta-support">
                Book a free call to discuss scope, priorities, and the most sensible technical direction.
              </p>
            </div>
            <div className="cta-actions">
              <a className="button button-primary" href="#contact">
                Get in Touch
              </a>
              <a className="button button-dark-secondary" href="#contact">
                Book a Free Call
              </a>
            </div>
          </div>
        </section> */}

        <section className="content-section contact-section" id="contact">
          <div className="container contact-grid">
            <div className="section-heading reveal-on-scroll reveal-left">
              <span className="eyebrow">Contact Us</span>
              <h2>Tell us about your requirements and we will get back to you</h2>
              <p>
                Use the enquiry form below or contact us directly. We work with businesses in Dundee and across the UK. Free no-obligation voice or video consultations are available.
              </p>
            </div>

            <aside
              className="contact-dragon reveal-on-scroll reveal-right delay-1"
              aria-label="Draggable Hydra dragon animation"
            >
              <canvas ref={contactDragonCanvasRef} />
            </aside>

            <div className="contact-direct surface-card reveal-on-scroll reveal-left delay-2">
              <div>
                <span className="contact-label">Email</span>
                <a href="mailto:contact@hydradigital.co.uk">contact@hydradigital.co.uk</a>
              </div>
              <div>
                <span className="contact-label">WhatsApp / Phone</span>
                <a href="tel:+447459876609">+44 7459 876609</a>
              </div>
              <div>
                <span className="contact-label">Availability</span>
                <p>Feel free to send a message or phone at any time. Free no-obligation voice or video consultations available.</p>
              </div>
            </div>

            <form
              className="contact-form surface-card reveal-on-scroll reveal-zoom delay-1"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="Optional"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  <span>Company</span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, company: event.target.value }))
                    }
                    placeholder="Company name"
                    autoComplete="organization"
                  />
                </label>
                <label className="full-width visually-hidden" aria-hidden="true">
                  <span>Website</span>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, website: event.target.value }))
                    }
                  />
                </label>
                <label className="full-width">
                  <span>Project details</span>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, details: event.target.value }))
                    }
                    placeholder="Tell us about what you need, what the software should do, and any rough timescales."
                    rows={7}
                    required
                  />
                </label>
              </div>

              <div className="form-footer">
                <button className="button button-primary" type="submit" disabled={formState === 'loading'}>
                  {formState === 'loading' ? 'Sending Enquiry...' : 'Send Enquiry'}
                </button>
                <p className={`form-message ${formState}`}>{formMessage || 'We aim to respond to all enquiries as quickly as possible, typically within a few hours.'}</p>
              </div>
            </form>
          </div>
        </section>
      </main>
  )
}

export default HomePage
