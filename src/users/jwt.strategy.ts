import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Model } from "mongoose";
import { User } from "./schema/users.schema";
import { TempPasswords } from "./schema/temp-passwords.schema";
import * as jwt from 'jsonwebtoken';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }


    async validateUser(payload: any) {
        const { id } = payload;
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new UnauthorizedException("Log in to access this endpoint")
        }
        return user;
    }

    async validateEmail(payload: any) {
        const { email } = payload;
        const user = await this.userModel.findOne({ email: email });
        if (!user) {
            throw new UnauthorizedException("Token de validare invalid")
        }
        return user;
    }


    async isTokenExpired(token: string): Promise<boolean> {
        try {
            const decoded = jwt.decode(token) as any;
            if (!decoded || !decoded.exp) {
                throw new UnauthorizedException("Token expirat");
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            throw new UnauthorizedException("Token expirat");
        }
    }


}