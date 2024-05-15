import { IsEmail, IsNotEmpty, MinLength, IsString, ValidateIf, IsStrongPasswordOptions, IsStrongPassword, isString, isNotEmpty } from "class-validator"


const passOptions: IsStrongPasswordOptions = {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
};


export class PassResetDto {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @IsStrongPassword(passOptions, { message: "Parola slaba" })
    readonly password: string
}
