import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { UserProvider } from '../user/user';
import { HttpFactory } from '../../util/http-factory';
import { Observable } from 'rxjs/Observable';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

@Injectable()
export class EstimateProvider {

  private apiUrl = environment.apiUrl

  constructor(
    public http: HttpClient,
    public userProvider: UserProvider,
    public file: File,
    public fileTransfer: FileTransfer) {
    console.log('Hello EstimateProvider Provider');
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

  public getEstimateList(page = 1) {
    const url = `${this.apiUrl}/orcamento`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}`, Page: page.toString() })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getEstimateById(id) {
    const url = `${this.apiUrl}/orcamento?id=${id}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public postEstimate(estimate) {
    const url = `${this.apiUrl}/orcamento`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = this.initEstimateData(estimate)
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public updateEstimate(estimate) {
    const url = `${this.apiUrl}/orcamento`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = this.initEstimateData(estimate)
    const request: Observable<HttpEvent<any>> = this.http.put<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public confirmEstimate(estimateId, creditCardId, installments, price) {
    const url = `${this.apiUrl}/orcamento?id=${estimateId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({
      pago: true,
      parcela: installments,
      valor: price * 100,
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

  public confirmWithPaymentSlip(estimateId, senderHash) {
    const url = `${this.apiUrl}/orcamento/confirmar`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ id: estimateId, metodoPagamento: 2, senderHash })
    
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public finishEstimate(estimateId, constructionJournal, imageList) {
    const url = `${this.apiUrl}/orcamento/?id=${estimateId}`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ concluida: true, diarioObra: constructionJournal })
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response.then((data: any) => {
      if(imageList.length == 0){
        return Promise.resolve({})
      } else {
        const promiseList: Array<Promise<any>> = []
        imageList.forEach(image => promiseList.push(this.saveEstimateImage(image, estimateId)))
  
        return Promise.all(promiseList)
      }
    })
  }

  private initEstimateData(estimate) {
    const orcamento = {
      usuarioId: this.userProvider.user.id,
      solicitacaoId: estimate.solicitationId,
      dataEntrega: estimate.deliveryDate,
      observacao: estimate.observation,
      maoObra: parseFloat(estimate.labor).toFixed(2),
      material: parseFloat(estimate.material).toFixed(2),
      concluido: estimate.finished,
      usuarioColaboradorId: estimate.colaboratorList,
      pago: estimate.paid,
    }

    if(estimate.estimateId) orcamento['id'] = estimate.estimateId

    return JSON.stringify(orcamento)
  }

  private saveEstimateImage(image, solicitationId) {
    const url = `${this.apiUrl}/imagensOrcamento?id=${solicitationId}`
    const headers = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })

    headers.headers["Content-Type"] = 'multipart/form-data';

    const options: FileUploadOptions = {
      headers: headers,
      httpMethod: 'post',
      fileKey: 'valor',
      mimeType: "multipart/form-data",
    }

    const fileTransfer: FileTransferObject = this.fileTransfer.create()
    
    return fileTransfer.upload(image, url, options)
  }

  public rateVisit(estimateId, rate) {
    const url = `${this.apiUrl}/orcamento/avaliacao?id=${estimateId}`
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

  public postExtraTax(estimateId, value) {
    const url = `${this.apiUrl}/taxa_extra`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ orcamentoId: estimateId, valor: value})
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public confirmExtraTax(taxId, creditCardId, installments = 1) {
    const url = `${this.apiUrl}/taxa_extra`
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const body = JSON.stringify({ id: taxId, requisicao: { parcela: installments, cartaoId: creditCardId } })
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

}
