import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from "mongoose"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { GetUserDto } from './dto/getuser-dto';
import { User } from './schema/users.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtStrategy } from './jwt.strategy';
import { Query } from "express-serve-static-core";
import { ActivateUser } from './dto/activate-user.dto';
import * as fs from 'fs';
import * as path from 'path';



@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
        @Inject(JwtStrategy) private readonly jwtStrategy: JwtStrategy
    ) { }


    private async sendConfirmationEmail(email: string, confirmationToken: string): Promise<void> {

        const confirmationLink = `http://localhost:3055/users/activate/${confirmationToken}`;

        const templatePath = path.resolve(__dirname, '..', '..', 'src/templates', 'confirmation-email.html');

        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const htmlContent = htmlTemplate.replace("{{linktofollow}}", confirmationLink);

        await this.mailerService.sendMail({
            to: email,
            subject: 'Confirm Your Email Address',
            html: htmlContent,
        });

    }



    async activateAccount(body: ActivateUser): Promise<User> {

        try {
            const decoded = this.jwtService.verify(body.confirmationToken)

            const user = await this.jwtStrategy.validateEmail(decoded);
            if (!user) {
                throw new NotFoundException('Invalid or expired confirmation token');
            }
            if (user.isActivated == true) {
                throw new ConflictException('This email address is already active');
            }
            user.isActivated = true;
            user.confirmationToken = "";
            await user.save();

            return user;
        } catch (error) {
            throw new NotFoundException('Invalid or expired confirmation token');
        }
    }


    async register(createUserDto: CreateUserDto): Promise<{ user: CreateUserDto }> {

        const { gender, birthday, username, email, password } = createUserDto;
        const user = await this.userModel.findOne({
            $or: [{ email }, { username }]
        });
        if (user) {
            throw new ConflictException('This user is already registered')
        }
        const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 60 });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.userModel.create({
            gender,
            birthday,
            username,
            email,
            password: hashedPassword,
            confirmationToken
        })

        await this.sendConfirmationEmail(email, confirmationToken)

        return { user: newUser }
    }






    async login(loginDto: LoginUserDto): Promise<{ token: string }> {

        const { email, username, password } = loginDto;


        const user = await this.userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            throw new NotFoundException('Invalid credentials')
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password)

        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid password')
        }

        const token = this.jwtService.sign({ id: user._id })

        return { token }

    }



}
