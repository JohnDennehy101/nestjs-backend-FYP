import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "src/auth/auth.service";
import { User } from "../user.entity";
import { UsersService } from "../users.service";


@Injectable()
export class IsActivatedEventRequestsGuard implements CanActivate {
    constructor(private usersService: UsersService, private authService: AuthService) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const jwtToken = request.headers.authorization.toString().replace('Bearer ', '');

        const decodedTokenInfo = await this.authService.decodeJwtToken(jwtToken);

        if (decodedTokenInfo) {
            let userEmail = decodedTokenInfo.email;

            let validUserCheck = await this.usersService.checkConfirmedUser(userEmail);

            if (validUserCheck) {
                return true
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
       
    }
}