import { Injectable } from '@nestjs/common';
const formData = require('form-data');
import { EmailOptions, MailgunService } from '@nextnm/nestjs-mailgun';

@Injectable()
export class EmailsService {

    constructor(private mailgunService: MailgunService) {}

    async sendEmailConfirmationEmail(email: string) : Promise<any> {
        const validationUrl = 'https://www.google.ie'
        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Confirmation Email`,
            template: 'confirm-email-template',
            'h:X-Mailgun-Variables': JSON.stringify({ // be sure to stringify your payload
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
}
