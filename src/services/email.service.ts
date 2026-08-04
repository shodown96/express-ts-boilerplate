import { APP_NAME } from "@/constants/app";
import fs from "fs";
import nodemailer from "nodemailer";

const pathKVP = {
  otp: "src/templates/otp.html",
  reset: "src/templates/reset.html",
  welcome: "src/templates/welcome.html",
};

type PathKVPType = keyof typeof pathKVP

type EmailTemplateParams = {
  otp: { name: string; otp: string };
  reset: { name: string; otp: string };
  welcome: { name: string };
};

interface HTMLEmailProps<T extends PathKVPType> {
  email?: string;
  subject: string;
  params: EmailTemplateParams[T];
  emailType: T;
}

interface EmailProps {
  email: string,
  subject: string,
  text: string,
  replyTo?: string,
}


export class EmailService {
  static sendEmail = async ({
    email = String(process.env.EMAIL_CONTACT_ADDRESS),
    subject,
    text,
    replyTo,
  }: EmailProps) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const sent = await transporter.sendMail({
        from: `${APP_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: text,
        replyTo: replyTo || (email === process.env.EMAIL_CONTACT_ADDRESS ? undefined : process.env.EMAIL_CONTACT_ADDRESS)
      });
      // console.log(sent)

      // console.log('email sent sucessfully');
      if (sent) {
        return true;
      }
    } catch (error) {
      // console.log(error, 'email not sent');
      return false;
    }
  };

  static sendHTMLEmail = async <T extends PathKVPType>({
    email = String(process.env.EMAIL_CONTACT_ADDRESS),
    subject,
    params,
    emailType,
  }: HTMLEmailProps<T>) => {
    const htmlTemplate = fs.readFileSync(pathKVP[emailType], "utf-8");

    // Replace template placeholders with dynamic data
    const fullParams = { ...params, appName: APP_NAME } as Record<string, string>
    const filledTemplate = htmlTemplate.replace(/{{(\w+)}}/g, (match, p1) => {
      return fullParams[p1] || match;
    });
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const sent = await transporter.sendMail({
        from: `${APP_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: filledTemplate,
        replyTo: email === process.env.EMAIL_CONTACT_ADDRESS ? undefined : process.env.EMAIL_CONTACT_ADDRESS
      });
      // console.log(sent)
      if (sent) {
        console.log("[email]: Email sent sucessfully!");
        return true;
      }
    } catch (error) {
      console.log("[email]: Email not sent!", error);
      return false;
    }
  };
}