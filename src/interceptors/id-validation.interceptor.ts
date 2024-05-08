import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as mongoose from 'mongoose';


@Injectable()
export class IdValidationInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

        const request = context.switchToHttp().getRequest();

        if (request.params.id) {
            const id = request.params.id
            const isValidId = mongoose.isValidObjectId(id);

            if (!isValidId) {
                throw new HttpException('Invalid ID type', HttpStatus.BAD_REQUEST)
            }
        }

        return next.handle()
    }
}