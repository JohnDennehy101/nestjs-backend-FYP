import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { User } from "../user.entity";
import { UsersService } from "../users.service";


@Injectable()
export class IsActivatedGuard implements CanActivate {
    constructor(private usersService: UsersService) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { email } = request.body;

        if (!email) {
            return false;
        }
        let confirmedUserCheck = await this.usersService.checkConfirmedUser(email);
        if (confirmedUserCheck) {
             return true;
        }
        else {
            return false;
        }
       
    }
}