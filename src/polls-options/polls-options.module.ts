import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsOptionsRepository } from './polls-options.repository';
import { PollsOptionsService } from './polls-options.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([PollsOptionsRepository])],
  providers: [PollsOptionsService],
  exports: [PollsOptionsService, TypeOrmModule]
})
export class PollsOptionsModule {}
