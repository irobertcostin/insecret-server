import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, IsStrongPassword, IsStrongPasswordOptions, MinLength, isEnum, isStrongPassword } from "class-validator"



const passOptions: IsStrongPasswordOptions = {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
};

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    readonly gender: string

    @IsNotEmpty()
    @IsString()
    readonly birthday: string

    @IsNotEmpty()
    @MinLength(4, { message: "min. 4 litere" })
    @IsString()
    readonly username: string

    @IsNotEmpty()
    @IsEmail({}, { message: 'Format email invalid' })
    readonly email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @IsStrongPassword(passOptions, { message: "Parola slaba" })
    readonly password: string


    @IsString()
    readonly avatar: string

}