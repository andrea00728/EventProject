import { Injectable, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import nodemailer from "nodemailer";
import path from 'path';

@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly fromEmail: string;

  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (!smtpUser || !smtpPass) {
      throw new Error('❌ SMTP_USER ou SMTP_PASS manquant dans le .env');
    }

    this.fromEmail = smtpUser;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true pour SSL (465), false pour TLS (587)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendEmail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const logoPath = path.resolve('assets/images/logo_icone.gif');

    const mailOptions = {
      from: `"MasterTable Support" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || "Réponse à votre message - MasterTable",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="cid:logoMasterTable" alt="MasterTable Logo" style="max-width:150px;"/>
          </div>
          <h2 style="color:#4CAF50; text-align:center;">MasterTable</h2>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath, 
          cid: "logoMasterTable",   // doit correspondre au src="cid:logoMasterTable"
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec logo intégré à", to);
  }
}
