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
    static findOneAndUpdate(arg0: { email: any; confirmationToken: string; }, arg1: { $unset: { confirmationToken: string; }; }) {
        throw new Error('Method not implemented.');
    }
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

    @Prop({ default: null })
    confirmationToken: string;

    @Prop({ default: false })
    isActivated: boolean;


}


export const UserSchema = SchemaFactory.createForClass(User)