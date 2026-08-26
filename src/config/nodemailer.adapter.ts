import nodemailer, { type Transporter } from "nodemailer";
import { Logger } from "./logger.plugin.js";
import { withTimeout } from "./timeout.helper.js";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  path: string;
}

export interface EmailServiceOptions {
  checkHealthTimeoutMs?: number;
  sendEmailTimeoutMs?: number;
}

export class EmailService {

  private transporter: Transporter;
  private checkHealthTimeoutMs: number;
  private sendEmailTimeoutMs: number;

  constructor(
    mailerService: string,
    mailerEmail: string,
    mailerSecretKey: string,
    options: EmailServiceOptions = {}
  ){
    this.checkHealthTimeoutMs = options.checkHealthTimeoutMs ?? 5_000;
    this.sendEmailTimeoutMs = options.sendEmailTimeoutMs ?? 15_000;

    this.transporter = nodemailer.createTransport({
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: mailerSecretKey
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    } as nodemailer.TransportOptions);
  }

  async checkHealth(): Promise<boolean> {
    try {
      await withTimeout(
        this.transporter.verify(),
        this.checkHealthTimeoutMs,
        "Mailer Health Check"
      );
      return true;
    } catch(error) {
      Logger.error(`Mailer Health Error: ${error}`);
      return false;
    }
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    const { to, subject, htmlBody, attachments } = options;
    try {
      await withTimeout(
        this.transporter.sendMail({
          to: to,
          subject: subject,
          html: htmlBody,
          attachments: attachments ?? []
        }),
        this.sendEmailTimeoutMs,
        "Mailer Send Email"
      );
      return true;
    } catch(error) {
      Logger.error(`Mailer Send Error: ${error}`);
      return false;
    }
  }

}