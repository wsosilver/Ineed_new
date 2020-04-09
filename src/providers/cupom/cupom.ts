import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
import { environment } from '../../environment/environment';
import { HttpFactory } from '../../util/http-factory';
import { Observable } from 'rxjs';

@Injectable()
export class CupomProvider {
  private url = `${environment.apiUrl}`

  constructor(private http: HttpClient, private userProvider: UserProvider) {
    console.log('Hello CupomProvider Provider');
  }

  public getUserDiscountCode() {
    const route = `${this.url}/cupom`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(route, params)
  
    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
  
    return response
  }

  public getDiscount() {
    const route = `${this.url}/desconto`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(route, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })

    return response
  }

  public activate(code) {
    const route = `${this.url}/desconto`
    const body = JSON.stringify({ codigo: code })
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.post<any>(route, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })

    return response
  }

}
