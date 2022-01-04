import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsRepository } from './polls.repository';
import { PollsService } from './polls.service';

@Module({
  imports: [  
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([PollsRepository])
  ],
  providers: [PollsService],
  exports: [PollsService, TypeOrmModule]
})
export class PollsModule {}
