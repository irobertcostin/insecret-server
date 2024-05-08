import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from "mongoose"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { GetUserDto } from './dto/getuser-dto';
import { User } from './schema/users.schema';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private jwtService: JwtService
    ) { }


    async register(createUserDto: CreateUserDto): Promise<{ token: string }> {

        const { gender, birthday, username, email, password } = createUserDto;

        const user = await this.userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (user) {
            throw new ConflictException('This user is already registered')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.userModel.create({
            gender,
            birthday,
            username,
            email,
            password: hashedPassword,
        })

        const token = this.jwtService.sign({ id: newUser._id })

        return { token }
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
