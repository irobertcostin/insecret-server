import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class UsernameInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        if (request.body && request.body.username) {
            request.body.username = request.body.username.toLowerCase();
        } else if (request.body && request.body.account) {
            request.body.account = request.body.account.toLowerCase();
        }
        return next.handle().pipe(
            map((data) => {
                return data
            })
        )
    }
}