import { Injectable, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import nodemailer from "nodemailer";
import path from 'path';

@Injectable()
export class EmailService {
  private readonly fromEmail: string;

  constructor() {
    const from = process.env.SENDGRID_FROM_EMAIL;
    if (!from) throw new Error('SENDGRID_FROM_EMAIL n’est pas défini dans le .env');
    this.fromEmail = from;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY n’est pas défini dans le .env');
    sgMail.setApiKey(apiKey);
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
          <br>
          <p style="font-size:14px; color:#555;">Si vous avez des questions, vous pouvez répondre directement à cet email.</p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
          <p style="font-size:12px; color:#999; text-align:center;">
            Cet email a été envoyé automatiquement par <b>MasterTable</b>.
          </p>
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
