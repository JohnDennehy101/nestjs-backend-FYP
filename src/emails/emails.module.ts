import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { MailgunModule } from '@nextnm/nestjs-mailgun';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailgunModule.forRoot({
      username: process.env.MAILGUN_USERNAME,
      key: process.env.MAILGUN_API_KEY,
    }),
    AuthModule,
  ],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
