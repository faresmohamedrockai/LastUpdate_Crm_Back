import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  function convertBigIntToString(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        const value = obj[key];
        newObj[key] =
          typeof value === 'bigint' ? value.toString() : convertBigIntToString(value);
      }
      return newObj;
    }
    return obj;
  }
  
  @Injectable()
  export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(map((data) => convertBigIntToString(data)));
    }
  }
  