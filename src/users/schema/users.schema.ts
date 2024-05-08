import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



export enum Category {
    MASCULIN = "Masculin",
    FEMININ = 'Feminin',
    NON_BINAR = "Non-binar"
}


@Schema({
    timestamps: true
})



export class User extends Document {
    @Prop()
    gender: Category;

    @Prop()
    birthday: string;

    @Prop({ unique: [true, 'This username is already in use'] })
    username: string

    @Prop({ unique: [true, 'This email is already registered'] })
    email: string

    @Prop()
    password: string

    @Prop()
    avatar: string


}


export const UserSchema = SchemaFactory.createForClass(User)