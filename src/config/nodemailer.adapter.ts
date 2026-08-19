import nodemailer, {type Transporter} from "nodemailer";
import { Logger } from "./logger.plugin.js";

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

export class EmailService {

  private transporter: Transporter; 

  constructor(
    mailerService: string,
    mailerEmail: string,
    mailerSecretKey: string
  ){
    this.transporter = nodemailer.createTransport({
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: mailerSecretKey
      }
    });
      
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch(error) {
      Logger.error(`Mailer Health Error: ${error}`);
      return false;
    }
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    const {to, subject, htmlBody, attachments} = options;
    try {
      const sentInformation = this.transporter.sendMail({
        to: to,
        subject: subject,
        html: htmlBody,
        attachments: attachments ?? []
      });
      return true;
    } catch(error) {
      return false;
    }
  }

}