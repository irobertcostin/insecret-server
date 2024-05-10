import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { EmailInterceptor } from 'src/interceptors/email.interceptor';
import { IdValidationInterceptor } from 'src/interceptors/id-validation.interceptor';
import { UsersService } from './users.service';
import { Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { UsernameInterceptor } from 'src/interceptors/username.interceptor';
import { Query as ExpressQuery } from "express-serve-static-core"
import { ActivateUser } from './dto/activate-user.dto';
import { User } from './schema/users.schema';


@Controller('users')
@UseInterceptors(EmailInterceptor, IdValidationInterceptor, UsernameInterceptor)
export class UsersController {

    constructor(
        private userService: UsersService

    ) { }

    @Post('register')
    register(
        @Body()
        createUserDto: CreateUserDto
    ): Promise<{ message: string }> {
        return this.userService.register(createUserDto)
    }

    @Post('activate-account')
    activateAccount(
        @Body()
        body: ActivateUser
    ): Promise<{ message: string }> {
        return this.userService.activateAccount(body);
    }


    @Post('resend-validation-token')
    resendActivationToken(
        @Body()
        body: any
    ): Promise<{ message: string }> {
        return this.userService.resendActivationToken(body.email);
    }




    @Post('login')
    login(
        @Body()
        loginUserDto: LoginUserDto
    ): Promise<{ token: string }> {
        return this.userService.login(loginUserDto)
    }



}
