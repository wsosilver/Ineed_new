import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HTTP_INTERCEPTORS,
  HttpErrorResponse} from '@angular/common/http'

import { AuthenticationProvider } from '../providers/authentication/authentication'

import { Observable } from 'rxjs'
import 'rxjs/add/operator/do'

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
  declarations: []
})

export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(public authProvider: AuthenticationProvider) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do(
      (event: HttpEvent<any>) => {},
      (error: any) => {
        if(error instanceof HttpErrorResponse && error.status === 401)
          this.authProvider.signout()
      })
  }
}
