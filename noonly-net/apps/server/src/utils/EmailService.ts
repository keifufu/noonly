import { type User } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { customAlphabet } from 'nanoid'
import nodemailer from 'nodemailer'
import { redis } from '../database/redis'
import { Env } from './env'

const nanoid = customAlphabet('0123456789')

const transporter = nodemailer.createTransport({
  host: Env.instance.get('MAIL_SERVER_HOST'),
  port: Env.instance.get('MAIL_SERVER_PORT'),
  secure: Env.instance.get('MAIL_SERVER_SECURE'),
  auth: {
    user: Env.instance.get('MAIL_SERVER_USER'),
    pass: Env.instance.get('MAIL_SERVER_PASS')
  },
  tls: { rejectUnauthorized: false }
})

const EmailService = {
  sendVerificationEmail: (user: User, throwError = false): Promise<void> => new Promise(async (resolve) => {
    try {
      const code = nanoid(6)
      await redis.set(`EMAIL-VERIFICATION-CODE-${user.email}`, code, 'EX', 300)
      transporter.sendMail({
        from: Env.instance.get('NOREPLY_EMAIL'),
        to: user.email,
        subject: `${code} - Your verification code`,
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: ${code}</p>`
      }, (err) => {
        if (err && throwError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send verification email' })
        resolve()
      })
    } catch {
      if (throwError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send verification email' })
      resolve()
    }
  }),
  sendMfaEmail: (user: User, throwError = false): Promise<void> => new Promise(async (resolve) => {
    try {
      const code = nanoid(6)
      await redis.set(`EMAIL-MFA-CODE-${user.email}`, code, 'EX', 300)
      transporter.sendMail({
        from: Env.instance.get('NOREPLY_EMAIL'),
        to: user.email,
        subject: `${code} - Your verification code`,
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: ${code}</p>`
      }, (err) => {
        if (err && throwError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send mfa email' })
        resolve()
      })
    } catch {
      if (throwError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send mfa email' })
      resolve()
    }
  })
}

export default EmailService