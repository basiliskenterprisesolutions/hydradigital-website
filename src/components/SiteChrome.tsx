import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import logoAsset from '../../logos/logo-tight.svg'
import { isWebKitConstrainedEnvironment } from '../lib/env'

// Header, footer and the site-wide canvas/cursor chrome, shared by every route.
// Extracted from App.tsx unchanged so the homepage renders identically; the
// hero-specific scroll effects stayed behind in HomePage.
function SiteChrome({ children }: { children: ReactNode }) {
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const cursorRingRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = backgroundCanvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    const isReducedCapability = isWebKitConstrainedEnvironment()
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isReducedCapability ? 1.5 : 2)
    let width = 0
    let height = 0
    let animationFrameId = 0
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      alpha: number
      hue: number
    }

    const particles: Particle[] = []
    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.12,
      hue: Math.random() > 0.64 ? 158 : Math.random() > 0.5 ? 140 : 80,
    })

    const resizeCanvas = () => {
      const newWidth = window.innerWidth
      // Mobile browsers fire `resize` when the address bar shows/hides while scrolling,
      // changing innerHeight but not innerWidth - regenerating particles on that made the
      // whole background reshuffle mid-scroll. Only rebuild the particle field when the
      // width genuinely changes (real resize/orientation change), not just the height.
      const widthChanged = Math.abs(newWidth - width) > 1 || particles.length === 0

      width = newWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * devicePixelRatio)
      canvas.height = Math.floor(height * devicePixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

      if (widthChanged) {
        particles.length = 0
        const particleCount = prefersReducedMotion
          ? 42
          : isReducedCapability
            ? Math.min(52, Math.max(30, Math.floor(width / 26)))
            : Math.min(96, Math.max(58, Math.floor(width / 16)))
        for (let index = 0; index < particleCount; index += 1) {
          particles.push(createParticle())
        }
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const draw = () => {
      animationFrameId = window.requestAnimationFrame(draw)

      context.fillStyle = 'rgba(3, 3, 4, 0.18)'
      context.fillRect(0, 0, width, height)

      particles.forEach((particle, index) => {
        if (!prefersReducedMotion) {
          particle.x += particle.vx
          particle.y += particle.vy
        }

        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1
        }

        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${particle.alpha})`
        context.fill()

        for (let linkedIndex = index + 1; linkedIndex < particles.length; linkedIndex += 1) {
          const linkedParticle = particles[linkedIndex]
          const distanceX = particle.x - linkedParticle.x
          const distanceY = particle.y - linkedParticle.y
          const distance = Math.hypot(distanceX, distanceY)

          if (distance < 122) {
            const alpha = (1 - distance / 122) * 0.15
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(linkedParticle.x, linkedParticle.y)
            context.strokeStyle = `rgba(56, 199, 147, ${alpha})`
            context.lineWidth = 0.5
            context.stroke()
          }
        }

        if (!hasCoarsePointer) {
          const mouseDistanceX = particle.x - mouseX
          const mouseDistanceY = particle.y - mouseY
          const mouseDistance = Math.hypot(mouseDistanceX, mouseDistanceY)

          if (mouseDistance < 210) {
            const alpha = (1 - mouseDistance / 210) * 0.42
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(mouseX, mouseY)
            context.strokeStyle = `rgba(56, 199, 147, ${alpha})`
            context.lineWidth = 0.5
            context.stroke()
          }
        }
      })
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrameId)
        animationFrameId = 0
      } else if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(draw)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    document.addEventListener('visibilitychange', onVisibilityChange)

    if (!hasCoarsePointer) {
      document.addEventListener('mousemove', onMouseMove)
    }

    animationFrameId = window.requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('mousemove', onMouseMove)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = cursorRingRef.current

    if (!cursor || !ring) {
      return
    }

    const customCursorMedia = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 861px)',
    )

    if (!customCursorMedia.matches) {
      return
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let animationFrameId = 0

    const syncCursor = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      cursor.style.left = `${mouseX}px`
      cursor.style.top = `${mouseY}px`
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`
      animationFrameId = window.requestAnimationFrame(animateRing)
    }

    const growCursor = () => {
      cursor.classList.add('is-active')
      ring.classList.add('is-active')
    }

    const shrinkCursor = () => {
      cursor.classList.remove('is-active')
      ring.classList.remove('is-active')
    }

    const interactiveElements = Array.from(
      document.querySelectorAll<HTMLElement>('a, button, input, textarea, .surface-card, .solution-card'),
    )

    document.documentElement.classList.add('has-custom-cursor')
    document.addEventListener('mousemove', syncCursor)
    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', growCursor)
      element.addEventListener('mouseleave', shrinkCursor)
    })
    animationFrameId = window.requestAnimationFrame(animateRing)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      document.removeEventListener('mousemove', syncCursor)
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', growCursor)
        element.removeEventListener('mouseleave', shrinkCursor)
      })
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header')
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.surface-card, .solution-card'))

    const syncHeader = () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 50)
    }

    const syncCardGlow = (event: MouseEvent) => {
      const card = event.currentTarget as HTMLElement
      const rect = card.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mx', `${x.toFixed(1)}%`)
      card.style.setProperty('--my', `${y.toFixed(1)}%`)
    }

    syncHeader()
    window.addEventListener('scroll', syncHeader, { passive: true })
    cards.forEach((card) => card.addEventListener('mousemove', syncCardGlow))

    return () => {
      window.removeEventListener('scroll', syncHeader)
      cards.forEach((card) => card.removeEventListener('mousemove', syncCardGlow))
    }
  }, [])

  return (
    <div className="page-shell">
      <div className="cursor-dot" ref={cursorRef} aria-hidden="true" />
      <div className="cursor-ring" ref={cursorRingRef} aria-hidden="true" />
      <canvas className="background-canvas" ref={backgroundCanvasRef} aria-hidden="true" />

      <header className="site-header" id="home">
        <div className="container nav-row">
          {/* No aria-label, and the mark is alt="" on purpose: the adjacent text
              supplies the accessible name (WCAG 2.5.3), so screen readers do not
              say "Hydra Digital" twice. */}
          <a className="brand" href="/">
            <img src={logoAsset} alt="" className="brand-mark" fetchPriority="high" />
            <span className="brand-copy">
              <strong>Hydra Digital</strong>
              <small>Professional Digital Solutions</small>
            </span>
          </a>

          <nav className="site-nav" aria-label="Primary">
            <a href="/#services">Services</a>
            <a href="/#work">Portfolio</a>
            <a href="/#about">About</a>
            <a href="/#contact">Contact</a>
          </nav>

          <a className="button button-primary nav-cta" href="/#contact">
            Book a Free Consultation
          </a>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>Hydra Digital</h3>
            <p>Custom software and digital systems designed for serious commercial use. Based in Dundee, Scotland.</p>
          </div>
        
          <div>
            <span className="footer-heading">Contact</span>
            <a href="mailto:contact@hydradigital.co.uk">contact@hydradigital.co.uk</a>
            <a href="https://wa.me/447459876609" target="_blank" rel="noreferrer">
              WhatsApp: +44 7459 876609
            </a>
            <a href="tel:+447459876609">Phone: +44 7459 876609</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>Hydra Digital Ltd · Company No. SC903676 · © 2026 All rights reserved.</p>
          <p className="footer-location">
            <svg
              className="footer-location-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.2" fill="currentColor" />
            </svg>
            Dundee, Scotland
          </p>
        </div>
      </footer>
    </div>
  )
}

export default SiteChrome
