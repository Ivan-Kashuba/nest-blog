import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailManager {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegistrationConfirmEmail(userEmail: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Registration confirm',
        html: `<div>Hey! This email has been sent from Blog to confirm your email<br/><br/><a href="https://some-front.com/confirm-registration?code=${code}">Click here to confirm your email</a></div>`,
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  async sendPasswordRecoveryEmail(userEmail: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Password recovery',
        html: `<div>Hey! This email has been sent from Blog to recover your password<br/><br/><a href="https://some-front.com/password-recovery?recoveryCode=${code}">Click here to recover your password</a></div>`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
