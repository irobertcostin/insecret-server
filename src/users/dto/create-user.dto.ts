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
    @MinLength(5, { message: "min. 5 letters" })
    @IsString()
    readonly username: string

    @IsNotEmpty()
    @IsEmail({}, { message: 'This is not an email' })
    readonly email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @IsStrongPassword(passOptions, { message: "weak password" })
    readonly password: string


    @IsString()
    readonly avatar: string

}