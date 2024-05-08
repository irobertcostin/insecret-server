import { IsEmail, IsNotEmpty, MinLength, IsString, ValidateIf } from "class-validator"




export class LoginUserDto {

    @IsString()
    @ValidateIf((o) => o.email === undefined)
    readonly username: string;

    @IsEmail()
    @ValidateIf((o) => o.username === undefined)
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;
}
