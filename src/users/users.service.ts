import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { Decipher } from 'crypto';
import { PassResetDto } from './dto/pass-reset.dto';
import { TempPasswords } from './schema/temp-passwords.schema';
import { v4 as uuidv4 } from 'uuid';



@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
        @InjectModel(TempPasswords.name)
        private tempPasswordsModel: mongoose.Model<TempPasswords>,
        @Inject(JwtStrategy) private readonly jwtStrategy: JwtStrategy
    ) { }

    private async sendConfirmationEmail(email: string, confirmationToken: string): Promise<void> {
        const confirmationLink = `http://localhost:3000/validare-cont/${confirmationToken}`;
        const templatePath = path.resolve(__dirname, '..', '..', 'src/templates', 'email-validation.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = htmlTemplate.replace("{{linktofollow}}", confirmationLink);
        await this.mailerService.sendMail({
            to: email,
            subject: 'Validare adresa email',
            html: htmlContent,
        });
    }

    private async passwordResetEmail(email: string, confirmationToken: string): Promise<void> {
        const confirmationLink = `http://localhost:3000/confirmare-resetare-parola/${confirmationToken}`;
        const templatePath = path.resolve(__dirname, '..', '..', 'src/templates', 'password-reset.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = htmlTemplate.replace("{{linktofollow}}", confirmationLink);
        await this.mailerService.sendMail({
            to: email,
            subject: 'Resetare parola',
            html: htmlContent,
        });
    }

    async activateAccount(body: ActivateUser): Promise<{ message: string }> {
        const decoded = this.jwtService.verify(body.confirmationToken)
        const user = await this.jwtStrategy.validateEmail(decoded);
        if (!user) {
            throw new NotFoundException('Token invalid sau expirat.');
        }
        if (user.confirmationToken !== body.confirmationToken) {
            throw new NotFoundException('Token invalid sau expirat. Verifica adresa de email si acceseaza ultimul link trimis.');
        }
        if (user && user.isActivated == true) {
            throw new ConflictException('Acest cont este deja valid.');
        }
        user.isActivated = true;
        user.confirmationToken = "";
        await user.save();
        return { message: "Contul a fost validat. Acum te poti autentifica." }
    }

    async resendActivationToken(email: string): Promise<any> {
        const user = await this.userModel.findOne({ email });
        if (user.isActivated == false) {
            const isTokenExpired = await this.jwtStrategy.isTokenExpired(user.confirmationToken);
            if (!isTokenExpired) {
                return { message: `Un link de validare a fost deja trimis catre ${email}. Link-ul este valid 15 minute.` }
            } else {
                const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 900 });
                await this.sendConfirmationEmail(email, confirmationToken)
                await this.userModel.findOneAndUpdate({ email }, { confirmationToken });
                return { message: `Un link de validare a fost trimis catre ${email}. Link-ul este valid 15 minute.` }
            }
        } else {
            throw new ConflictException('Acest cont este deja valid.');
        }
    }

    async register(createUserDto: CreateUserDto): Promise<{ message: string }> {
        const { gender, birthday, username, email, password } = createUserDto;
        const user = await this.userModel.findOne({
            $or: [{ email }, { username }]
        });
        if (user) {
            throw new ConflictException('Adresa email sau nume utilizator deja inregistrat')
        }
        const userBirthday = new Date(birthday);
        const ageDiffMs = Date.now() - userBirthday.getTime();
        const ageDate = new Date(ageDiffMs);
        const userAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (userAge < 16) {
            throw new BadRequestException('Trebuie sa ai cel puțin 16 ani pentru a te inregistra');
        }
        const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 900 });
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userModel.create({
            gender,
            birthday,
            username,
            email,
            password: hashedPassword,
            confirmationToken
        })
        await this.sendConfirmationEmail(email, confirmationToken)
        return { message: `Un link de validare a fost trimis catre ${email}. Link-ul este valid 15 minute.` }
    }

    async login(loginDto: LoginUserDto): Promise<any> {
        const { account, password } = loginDto;
        const user = await this.userModel.findOne({
            $or: [{ email: account }, { username: account }]
        });
        if (!user) {
            throw new NotFoundException('Acest cont nu exista')
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password)
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Parola incorecta')
        }
        if (user && user.isActivated == true) {
            const token = this.jwtService.sign({ id: user._id })
            return { token }
        } else if (user && user.isActivated == false) {

            let email = user.email

            if (user.confirmationToken == "") {
                const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 900 });
                await this.sendConfirmationEmail(email, confirmationToken)
                await this.userModel.findOneAndUpdate({ email }, { confirmationToken });
                return { message: `Un link de validare a fost trimis catre ${email}. Link-ul este valid 15 minute.` }
            }
        }
    }

    async forgotPassword(body: PassResetDto): Promise<{ message: string }> {
        const { email, password } = body;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('Acest cont nu exista')
        }
        const attempt = await this.tempPasswordsModel.findOne({ email })
        if (attempt) {
            const isTokenExpired = await this.jwtStrategy.isTokenExpired(attempt.token);
            if (!isTokenExpired) {
                return { message: `Un link de confirmare pentru resetarea parolei a fost deja trimis catre ${email}. Link-ul este valid 15 minute.` }
            } else {
                await this.tempPasswordsModel.findOneAndDelete({ email })
                const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 900 });
                const hashedTempPassword = await bcrypt.hash(password, 10);
                await this.tempPasswordsModel.create({
                    email,
                    tempPassword: hashedTempPassword,
                    token: confirmationToken
                });
                await this.passwordResetEmail(email, confirmationToken)
                return { message: `Un link de validare a fost trimis catre ${email}. Link-ul este valid 15 minute.` }
            }
        } else {
            const confirmationToken = this.jwtService.sign({ email }, { expiresIn: 900 });
            const hashedTempPassword = await bcrypt.hash(password, 10);
            await this.tempPasswordsModel.create({
                email,
                tempPassword: hashedTempPassword,
                token: confirmationToken
            });
            await this.passwordResetEmail(email, confirmationToken)
            return { message: `Un link de validare a fost trimis catre ${email}. Link-ul este valid 15 minute.` }
        }
    }

    async confirmPasswordReset(body: ActivateUser): Promise<{ message: string }> {
        const decoded = this.jwtService.verify(body.confirmationToken)
        const isTokenExpired = await this.jwtStrategy.isTokenExpired(body.confirmationToken);
        if (isTokenExpired) {
            return { message: `Tokenul de validare a expirat. Te rugam sa reiei procesul de resetare al parolei.` }
        } else {
            let email = decoded.email
            const tempUser = await this.tempPasswordsModel.findOne({ email })
            if (!tempUser) {
                throw new NotFoundException('Tokenul de validare a expirat. Te rugam sa reiei procesul de resetare al parolei.');
            } else {
                let confirmedPass = tempUser.tempPassword
                await this.userModel.findOneAndUpdate({ email }, { password: confirmedPass })
                await this.tempPasswordsModel.findOneAndDelete({ email })
                return { message: "Parola a fost resetata cu succes. Acum te poti autentifica." }
            }
        }
    }

}
