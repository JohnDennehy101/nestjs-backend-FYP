import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsVotesRepository } from './polls-votes.repository';
import { PollsVotesService } from './polls-votes.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([PollsVotesRepository])],
  providers: [PollsVotesService],
  exports: [PollsVotesService, TypeOrmModule]
})
export class PollsVotesModule {}
