import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsOptionsModule } from 'src/polls-options/polls-options.module';
import { PollsRepository } from './polls.repository';
import { PollsService } from './polls.service';

@Module({
  imports: [  
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([PollsRepository]),
    PollsOptionsModule
  ],
  providers: [PollsService],
  exports: [PollsService, TypeOrmModule]
})
export class PollsModule {}
