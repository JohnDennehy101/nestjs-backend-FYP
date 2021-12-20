import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true
  }),
  AuthModule,
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DATABASE_USERNAME.toString(),
    password: process.env.DATABASE_PASSWORD.toString(),
    database: process.env.DATABASE_NAME.toString(),
    autoLoadEntities: true,
    synchronize: true
  })
],
  controllers: [],
  providers: [],
})

export class AppModule {}
