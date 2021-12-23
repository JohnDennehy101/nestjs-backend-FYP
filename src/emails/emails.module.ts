import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MailgunModule } from '@nextnm/nestjs-mailgun';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailgunModule.forRoot({
      username: process.env.MAILGUN_USERNAME,
      key: process.env.MAILGUN_API_KEY,
    }),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService]
})
export class EmailsModule {}
