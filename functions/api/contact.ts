/**
 * Contact form delivery, as a Cloudflare Pages Function.
 *
 * Replaces public/api/contact.php, which used PHP mail() on Hostinger shared
 * hosting. Same request and response shape, so the frontend needed no change
 * beyond the endpoint path - and /api/contact.php is still routed here by
 * contact.php.ts, because that URL is what every cached copy of the JS bundle
 * will keep posting to until it expires.
 *
 * Delivery is Resend, matching server.mjs. The apex MX records stay with
 * Hostinger, so company email is unaffected by the hosting move; this only
 * replaces the outbound path the enquiry form used.
 */

interface Env {
  RESEND_API_KEY?: string
  CONTACT_TO_EMAIL?: string
  CONTACT_FORWARD_EMAIL?: string
  CONTACT_FROM_EMAIL?: string
}

interface Submission {
  name: string
  email: string
  phone?: string
  company?: string
  details: string
  /** Honeypot. Real people never see this field, so anything in it is a bot. */
  website?: string
}

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const recipients = (...values: (string | undefined)[]) =>
  Array.from(
    new Set(
      values
        .flatMap((value) => String(value || '').split(','))
        .map((email) => email.trim())
        .filter(Boolean),
    ),
  )

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Submission

  try {
    body = await request.json<Submission>()
  } catch {
    return json(400, { ok: false, message: 'We could not read that submission. Please try again.' })
  }

  // Honeypot. Answer 200 so a bot cannot tell it was rejected and retry.
  if (body.website) return json(200, { ok: true, message: 'Thanks - your enquiry has been sent.' })

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const details = String(body.details || '').trim()
  const phone = String(body.phone || '').trim()
  const company = String(body.company || '').trim()

  if (!name || !email || !details) {
    return json(400, { ok: false, message: 'Please complete your name, email and project details.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, message: 'That email address does not look right.' })
  }
  if (details.length > 20000) {
    return json(400, { ok: false, message: 'That message is too long to send.' })
  }

  if (!env.RESEND_API_KEY) {
    // Loud rather than silent: a form that says "sent" and delivers nothing is
    // worse than one that admits it is misconfigured.
    return json(500, {
      ok: false,
      message: 'The contact form is not fully configured yet. Please email contact@hydradigital.co.uk directly.',
    })
  }

  const to = recipients(
    env.CONTACT_TO_EMAIL || 'contact@hydradigital.co.uk',
    env.CONTACT_FORWARD_EMAIL,
  )
  const from = env.CONTACT_FROM_EMAIL || 'Hydra Digital Website <website@hydradigital.co.uk>'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New Hydra Digital enquiry from ${name}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111318; line-height: 1.65;">
          <h2 style="margin-bottom: 16px;">New website enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not supplied')}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || 'Not supplied')}</p>
          <p><strong>Project details:</strong></p>
          <div style="padding: 16px; border: 1px solid #e6eaf0; border-radius: 12px; background: #f8fafc;">
            ${escapeHtml(details).replaceAll('\n', '<br />')}
          </div>
        </div>
      `,
      text: `New website enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not supplied'}\nCompany: ${company || 'Not supplied'}\n\nProject details:\n${details}`,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error('resend send failed', response.status, detail)
    return json(502, {
      ok: false,
      message: 'We could not send that just now. Please try again, or email contact@hydradigital.co.uk.',
    })
  }

  return json(200, { ok: true, message: 'Thanks - your enquiry has been sent. We will be in touch shortly.' })
}

/** A GET on the endpoint is not an error worth logging; say so plainly. */
export const onRequestGet: PagesFunction<Env> = async () =>
  json(405, { ok: false, message: 'This endpoint accepts POST requests only.' })
