import nodemailer from 'nodemailer';
import { config } from '../config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendRegistrationConfirmation(to: string, username: string) {
    const confirmationLink = `${config.frontendUrl}/verify-email?token=${this.generateVerificationToken(to)}`;

    const mailOptions = {
      from: config.email.from,
      to,
      subject: 'Potvrzení registrace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Vítejte v aplikaci!</h2>
          <p>Dobrý den ${username},</p>
          <p>děkujeme za vaši registraci. Pro dokončení registrace prosím potvrďte svou emailovou adresu kliknutím na tlačítko níže:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Potvrdit email
            </a>
          </div>
          <p>Pokud jste se neregistrovali, můžete tento email ignorovat.</p>
          <p>S pozdravem,<br>Váš tým</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Registration confirmation email sent to:', to);
    } catch (error) {
      console.error('Error sending registration confirmation email:', error);
      throw new Error('Failed to send registration confirmation email');
    }
  }

  async sendPasswordReset(to: string, resetToken: string) {
    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: config.email.from,
      to,
      subject: 'Reset hesla',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset hesla</h2>
          <p>Obdrželi jsme žádost o reset hesla pro váš účet.</p>
          <p>Pro reset hesla klikněte na tlačítko níže:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Resetovat heslo
            </a>
          </div>
          <p>Pokud jste o reset hesla nežádali, můžete tento email ignorovat.</p>
          <p>S pozdravem,<br>Váš tým</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', to);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private generateVerificationToken(email: string): string {
    // Zde by měla být implementace generování bezpečného tokenu
    // Pro demonstraci použijeme jednoduché řešení
    return Buffer.from(email + Date.now().toString()).toString('base64');
  }
}

export const emailService = new EmailService(); 