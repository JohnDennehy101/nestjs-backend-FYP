import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const formData = require('form-data');
import { EmailOptions, MailgunService } from '@nextnm/nestjs-mailgun';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class EmailsService {
   

    constructor(
        private mailgunService: MailgunService,
        private  authService: AuthService,
        private configService: ConfigService
        ) {}

    async sendEmailConfirmationEmail(email: string) : Promise<any> {
       const jwtToken = await this.authService.createJwtToken(email);
       const validationUrl = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${jwtToken.jwtToken}`

        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Confirmation Email`,
            template: 'confirm-email-template',
            'h:X-Mailgun-Variables': JSON.stringify({
            validationUrl
    }),

    };

    try {
        const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);
        return response;
    } catch (error) {
        console.log(error)
    }
  
    }

    async sendPollLinkEmail(email: string, eventName: string, pollCreatedBy: string, pollLink: string) : Promise<any> {
        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Poll Invite - ${eventName}`,
            template: 'poll-invite-email',
            'h:X-Mailgun-Variables': JSON.stringify({
            eventName,
            pollCreatedBy,
            pollLink
    }),

    };

    try {
    const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);

 
    return response;
    } catch (error) {
        console.log(error)
    }
  
    }
}
