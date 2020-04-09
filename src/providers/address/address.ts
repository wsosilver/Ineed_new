import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AddressProvider {

  constructor(public http: HttpClient) {
    console.log('Hello AddressProvider Provider');
  }

  getAddress(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`
    // const url = `http://api.postmon.com.br/v1/cep/${cep}`
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

}
