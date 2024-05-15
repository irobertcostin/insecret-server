import { IsEmail, IsNotEmpty, MinLength, IsString, ValidateIf } from "class-validator"




export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    readonly account: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
