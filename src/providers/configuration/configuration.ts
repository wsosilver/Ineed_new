import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpFactory } from '../../util/http-factory';
import { UserProvider } from '../user/user';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigurationProvider {
  
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private userProvider: UserProvider) {
    console.log('Hello ConfigurationProvider Provider');
  }

  public get() {
    const url = `${this.apiUrl}/configuracao`
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
