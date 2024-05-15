import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



@Schema({
    timestamps: true
})



export class TempPasswords extends Document {

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    tempPassword: string;

    @Prop({ required: true })
    token: string;

}


export const TempPasswordsSchema = SchemaFactory.createForClass(TempPasswords)