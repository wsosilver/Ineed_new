import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { UserProvider } from '../user/user';
import { HttpFactory } from '../../util/http-factory';
import { Observable } from 'rxjs/Observable';
import { CreditCardIdentifier } from '../../util/credit-card-identifier';

@Injectable()
export class CreditCardProvider {
  public apiUrl = environment.apiUrl
  public CREDIT_CARD_TYPES = {
    DEBIT: 1,
    CREDIT: 2
  }

  constructor(private http: HttpClient, private userProvider: UserProvider) {
    console.log('Hello CreditCardProvider Provider');
  }

  public get(page = 1) {
    const url = `${this.apiUrl}/cartoes`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getById(id) {
    const url = `${this.apiUrl}/cartoes?id=${id}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public add(creditCard) {
    const url = `${this.apiUrl}/cartoes`
    const body = this.initCreditCardData(creditCard)
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  private initCreditCardData(creditCard) {
    creditCard.cardNumber.replace(' ', '')

    if(creditCard.expirationYear.length == 2)
      creditCard.expirationYear = `20${creditCard.expirationYear}`

    creditCard.brand = CreditCardIdentifier.findBrand(creditCard.cardNumber)
    creditCard.tipoCartaoId = creditCard.cardTypeId
    creditCard.expirationDate = `${creditCard.expirationMonth}/${creditCard.expirationYear}`

    return JSON.stringify(creditCard)
  }

  public delete(id) {
    const url = `${this.apiUrl}/cartoes?Id=${id}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.delete<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

}
