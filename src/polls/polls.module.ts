import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsOptionsModule } from '../polls-options/polls-options.module';
import { PollsVotesModule } from '../polls-votes/polls-votes.module';
import { PollsRepository } from './polls.repository';
import { PollsService } from './polls.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([PollsRepository]),
    PollsOptionsModule,
    PollsVotesModule,
  ],
  providers: [PollsService],
  exports: [PollsService, TypeOrmModule],
})
export class PollsModule {}
