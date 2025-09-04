import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, html: string) {
  const host = process.env.EMAIL_HOST
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!host || !user || !pass) return { sent: false, reason: 'Email env not set' }
  const transporter = nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: { user, pass },
  })
  try {
    await transporter.sendMail({ from: user, to, subject, html })
    return { sent: true }
  } catch (e) {
    return { sent: false, reason: String(e) }
  }
}

// Placeholder for WhatsApp integration
export async function sendWhatsApp(_phone: string, _message: string) {
  if (!process.env.WHATSAPP_API_KEY) return { sent: false, reason: 'No API key' }
  // Integrate with provider here
  return { sent: false, reason: 'Not implemented' }
}

