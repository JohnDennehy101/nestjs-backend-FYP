import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUserDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
