import { EntityRepository, Repository } from "typeorm";
import { UserDto } from './dto/user.dto'
import { User } from './user.entity';
import { ConflictException, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
    async createUser(userDto : UserDto, hashedPassword: string) : Promise<User> {
        const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
        const {email, password} = userDto;
        

        if (!password.match(passwordRegex)) {
            throw new HttpException('Password too weak: must include at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character', HttpStatus.BAD_REQUEST)
        }
        const user = this.create({email, password: hashedPassword});

        try {
            await this.save(user);
            return user;
        } catch (error) {
            console.log(error);
            if (error.code === '23505') {
                throw new ConflictException('Account already exists with this email');
            }
            else {
                throw new InternalServerErrorException();
            }
        }
        
    }

    async createInvitedUser (email : string) : Promise<User> {
        const user = this.create({email: email});

        try {
            await this.save(user);
            return user;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException();
        }
    }
    findUserByEmail(email: string): Promise<User> {
        return this.findOne({email: email}) 
    }

    async setProfileImage(imageUrl: string, userId: string) {
        try {
            await this.update(userId, {
      ...(imageUrl && {profileImageUrl : imageUrl }),
    })
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}