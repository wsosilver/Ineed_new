import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environment/environment';

import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { HttpFactory } from '../../util/http-factory';
import { Observable } from 'rxjs/Observable';
import { UserProvider } from '../user/user';

@Injectable()
export class ServicesProvider {
  
  private apiUrl = environment.apiUrl

  constructor(
    public http: HttpClient,
    public userProvider: UserProvider,
    public file: File,
    public fileTransfer: FileTransfer) {
    console.log('Hello ServicesProvider Provider');
  }

  public getCategories() {
    const url = `${this.apiUrl}/categoria`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getServicesType(categorieId) {
    const url = `${this.apiUrl}/tipoServico?id=${categorieId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getServices(serviceTypeId) {
    const url = `${this.apiUrl}/servico?id=${serviceTypeId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }


}
