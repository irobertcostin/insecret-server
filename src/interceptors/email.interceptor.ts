import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class EmailInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();


        if (request.body && request.body.email) {
            request.body.email = request.body.email.toLowerCase();
        }

        return next.handle().pipe(

            map((data) => {
                return data
            })

        )


    }
}