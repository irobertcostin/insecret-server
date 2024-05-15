import { IsEmail, IsNotEmpty, IsString } from "class-validator"




export class GetUserDto {

    @IsNotEmpty()
    @IsString()
    readonly gender: string

    @IsNotEmpty()
    @IsString()
    readonly birthday: string


    @IsNotEmpty()
    @IsString()
    readonly username: string

    @IsNotEmpty()
    @IsEmail()
    readonly email: string


    @IsString()
    readonly avatar: string

}