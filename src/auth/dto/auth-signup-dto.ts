import { IsEmail, IsString, MaxLength, MinLength, Matches } from "class-validator";

export class AuthSignupDto {
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/, {
    message: 'Password too weak: must include at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character',
  })
    password: string;
}