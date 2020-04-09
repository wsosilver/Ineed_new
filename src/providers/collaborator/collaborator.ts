import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UserProvider } from '../user/user';

import { environment } from '../../environment/environment';

import { HttpFactory } from '../../util/http-factory';

import { Observable } from 'rxjs';

@Injectable()
export class CollaboratorProvider {
  private apiUrl = environment.apiUrl

  constructor(public http: HttpClient, public userProvider: UserProvider) {
    console.log('Hello CollaboratorProvider Provider');
  }

  getAll() {
    const collaboratorProfileId = UserProvider.ROLES.COLLABORATOR
    const route = `${this.apiUrl}/usuario/listarTodos?nome=&profileId=${collaboratorProfileId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(route, params)
  
    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
  
    return response
  }

}
