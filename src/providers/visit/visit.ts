import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
import { environment } from '../../environment/environment';
import { HttpFactory } from '../../util/http-factory';
import { Observable } from 'rxjs/Observable';

import moment from 'moment'

@Injectable()
export class VisitProvider {

  private apiUrl = environment.apiUrl

  constructor(public http: HttpClient, public userProvider: UserProvider) {
    console.log('Hello VisitProvider Provider');
  }

  getSessionId() {
    const url = `${this.apiUrl}/pagseguro/session`
    const headers = { Authorization: `${this.userProvider.user.token}`}
    const params = HttpFactory.getRequestOptions(headers)
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)
  
    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getVisitById(id) {
    const url = `${this.apiUrl}/visita?id=${id}`
    const headers = { Authorization: `${this.userProvider.user.token}`}
    const params = HttpFactory.getRequestOptions(headers)
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getVisitList(page = 1) {
    const url = `${this.apiUrl}/visita`
    const headers = { Authorization: `${this.userProvider.user.token}`, Page: page.toString() }
    const params = HttpFactory.getRequestOptions(headers)
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public createVisit(visit) {
    return this.saveVisit(visit)
  }

  private saveVisit(visit) {
    const url = `${this.apiUrl}/visita`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = this.initVisitData(visit)
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  private initVisitData(visit) {
    if(typeof visit.price ===  'string') {
      visit.price = visit.price.replace("," , ".")
      visit.price = parseFloat(visit.price).toFixed(2)
    }

    const visitDate = moment(`${visit.date} ${visit.time}`).format("YYYY-MM-DD HH:mm").toString()
    const visita = {
      valor: visit.price,
      observacao: visit.observation,
      profissionais: null,
      dataVisita: visitDate,
      concluida: visit.finished,
      pago: visit.paid,
      solicitacaoId: visit.solicitationId,
      usuarioColaboradorId: visit.colaboratorList,
    }

    if(visit.visitId)
      visita['id'] = visit.visitId

    return JSON.stringify(visita)
  }

  public confirmVisit(visitId, value, creditCardId) {
    const url = `${this.apiUrl}/visita?id=${visitId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({
      pago: true,
      valor: value * 100,
      cartaoId: creditCardId
    })
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public confirmWithPaymentSlip(visitId, senderHash) {
    const url = `${this.apiUrl}/visita/confirmar`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ id: visitId, metodoPagamento: 2, senderHash })
    
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public concludeVisit(visitId) {
    const url = `${this.apiUrl}/visita?id=${visitId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ concluida: true})
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public rateVisit(visitId, rate) {
    const url = `${this.apiUrl}/visita/avaliacao?id=${visitId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ nota: rate })
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

}
