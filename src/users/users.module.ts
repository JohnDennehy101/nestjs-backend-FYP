import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { EmailsModule } from '../emails/emails.module';
import { ImagesModule } from '../images/images.module';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([UsersRepository]),
    AuthModule,
    EmailsModule,
    ImagesModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule {}
