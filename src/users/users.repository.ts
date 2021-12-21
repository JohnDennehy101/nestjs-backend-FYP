import { EntityRepository, Repository } from "typeorm";
import { UserDto } from './dto/user.dto'
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
    async createUser(userDto : UserDto) : Promise<void> {
        const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
        const {email, password} = userDto;


       /*try {
            if (this.findUserByEmail(email)) {
            throw new HttpException('Account already exists with this email', HttpStatus.CONFLICT)
        }
        } catch (error) {
        
        }*/
        

        if (!password.match(passwordRegex)) {
            throw new HttpException('Password too weak: must include at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character', HttpStatus.BAD_REQUEST)
        }
        const generatedPassWordSalt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, generatedPassWordSalt);
        const user = this.create({email, password: hashedPassword});

        try {
            await this.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Account already exists with this email');
            }
            else {
                throw new InternalServerErrorException();
            }
        }
        
    }
    findUserByEmail(email: string): Promise<User> {
        return this.findOne({email: email}) 
    }
}