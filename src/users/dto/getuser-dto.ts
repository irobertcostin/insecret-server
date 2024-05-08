import { IsNotEmpty, IsString } from "class-validator"




export class GetUserDto {

    @IsNotEmpty()
    @IsString()
    readonly gender: string


    @IsNotEmpty()
    @IsString()
    readonly username: string

    @IsString()
    readonly avatar: string

}