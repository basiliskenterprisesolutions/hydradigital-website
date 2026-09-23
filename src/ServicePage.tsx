import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getService, inlineLinkPattern } from './data/services'

// Renders the [anchor text](/path) cross-links that service copy is allowed to
// carry, so related pages link to each other in the prose rather than through a
// boilerplate block. Pure and synchronous, so it runs during prerendering and
// the anchors are in the static HTML a crawler reads.
//
// String.split with a two-group pattern yields [text, label, href, text, ...],
// hence the stride of three.
function withLinks(text: string): ReactNode {
  const parts = text.split(inlineLinkPattern())

  if (parts.length === 1) {
    return text
  }

  const nodes: ReactNode[] = []

  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) {
      nodes.push(parts[i])
    }

    const label = parts[i + 1]
    const href = parts[i + 2]

    if (label && href) {
      nodes.push(
        <Link className="prose-link" key={`${href}-${i}`} to={href}>
          {label}
        </Link>,
      )
    }
  }

  return nodes
}

// Per-page <title>/meta/JSON-LD are written into the static HTML by
// scripts/prerender.mjs, which is what search engines read. The effect below
// only keeps the title honest during client-side navigation.
function ServicePage() {
  const { slug } = useParams()
  const service = getService(slug)

  useEffect(() => {
    if (service) {
      document.title = service.seoTitle
    }
  }, [service])

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
    )

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [slug])

  if (!service) {
    return (
      <main>
        <section className="content-section">
          <div className="container section-heading">
            <h1>Page not found</h1>
            <p>That service page does not exist.</p>
            <Link className="button button-primary" to="/">
              Back to home
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="service-page">
      <section className="service-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{service.navLabel}</span>
          </nav>

          <div className="service-hero-copy reveal-on-scroll reveal-rise reveal-hero">
            <span className="eyebrow">{service.eyebrow}</span>
            <h1>{service.h1}</h1>
            {service.intro.map((paragraph) => (
              <p className="service-lead" key={paragraph}>
                {withLinks(paragraph)}
              </p>
            ))}
            <div className="service-hero-actions">
              <a className="button button-primary" href="/#contact">
                Book a Free Consultation
              </a>
              <Link className="button button-secondary" to="/#services">
                See all services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="section-heading reveal-on-scroll reveal-rise">
            <h2>{service.capabilities.heading}</h2>
          </div>
          <ul className="capability-grid">
            {service.capabilities.items.map((item) => (
              <li className="capability-item reveal-on-scroll reveal-rise" key={item}>
                {withLinks(item)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {service.sections.map((section) => (
        <section className="content-section" key={section.heading}>
          <div className="container service-prose reveal-on-scroll reveal-rise">
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{withLinks(paragraph)}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="content-section">
        <div className="container">
          <div className="section-heading reveal-on-scroll reveal-rise">
            <span className="eyebrow">Common questions</span>
            <h2>Questions we are usually asked</h2>
          </div>
          <div className="faq-list">
            {service.faqs.map((faq) => (
              <div className="faq-item reveal-on-scroll reveal-rise" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{withLinks(faq.answer)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container service-cta reveal-on-scroll reveal-rise">
          <h2>Tell us what you need and we will give you a straight answer</h2>
          <p>
            Free no-obligation voice or video consultation. We work with businesses in Dundee
            and across the UK, and if we are not the right fit we will say so.
          </p>
          <a className="button button-primary" href="/#contact">
            Get in Touch
          </a>
        </div>
      </section>
    </main>
  )
}

export default ServicePage
