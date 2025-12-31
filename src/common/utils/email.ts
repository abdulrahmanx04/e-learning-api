import * as nodemailer from 'nodemailer'

import * as dotenv from 'dotenv'
dotenv.config()

const transporter= nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: '587',
    secure: false,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})


const templates= {
    verification: (url: string) => ({
        subject: 'Email verification',
        html: `
            <div>
                <p>Click here to verify your account (expires in 7 days)</p>
                <a href= "${url}">Verify your account </a>
            </div>
        `
    }),
    resetPassword: (url: string) => ({
        subject: 'Reset Your Password',
        html: `
            <div>
                <p>Click here to reset your password<p>
                <a href= "${url}">Reset your password</a>
            </div>
        `
    })
}


type emailType= 'verification' | 'resetPassword' 

export async function sendEmail(type: emailType, to: string,url: any) {
    const template= templates[type] (url)
    await transporter.sendMail({
        from: 'E-learning platform',
        to,
        subject: template.subject,
        html: template.html
    })
}