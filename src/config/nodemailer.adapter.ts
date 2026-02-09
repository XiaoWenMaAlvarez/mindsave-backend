import nodemailer, {type Transporter} from "nodemailer";

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