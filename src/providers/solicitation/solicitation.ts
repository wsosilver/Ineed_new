import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

import { Platform, normalizeURL } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';

import { UserProvider } from '../user/user';

import { HttpFactory } from '../../util/http-factory';

import { environment } from '../../environment/environment';


import moment from 'moment';

@Injectable()
export class SolicitationProvider {

  private apiUrl = environment.apiUrl

  constructor(
    public http: HttpClient,
    public userProvider: UserProvider,
    public file: File,
    public filePath: FilePath,
    public platform: Platform
  ) {
    console.log('Hello SolicitationProvider Provider');
  }

  public getSolicitationById(id) {
    const url = `${this.apiUrl}/listarSolicitacao?id=${id.toString()}`
    const headers = { Authorization: `${this.userProvider.user.token}` }
    const params = HttpFactory.getRequestOptions(headers)
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public getSolicitationList(page = 1, showInactive = false, filter = null, filterValue = null) {
    const url = `${this.apiUrl}/listarSolicitacao?filtrarPor=${filter}&filtroValor=${filterValue}`
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

  public postSolicitation(solicitation, imageList) {
    return this.initSolicitationData(solicitation, imageList).then(body => {
      const url = `${this.apiUrl}/solicitacaoComImagems`
      const headers = { Authorization: this.userProvider.user.token }
      const params = HttpFactory.getRequestOptions(headers)
      const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, { headers })

      console.log('REQUEST: ', request)
  
      return new Promise((resolve, reject) => {
        request.subscribe(
          data => resolve(data),
          error => reject(error))
      })
    })
  }

  private initSolicitationData(solicitation, imageList) {
    const solicitacaoFormData = new FormData()

    const dataInicial = moment(`${solicitation.startDate} ${solicitation.startTime}`)
    const dataFinal = moment(`${solicitation.startDate} ${solicitation.finishTime}`)

    solicitacaoFormData.append('dataInicial', dataInicial.format("YYYY-MM-DD HH:mm").toString())
    solicitacaoFormData.append('dataFinal', dataFinal.format("YYYY-MM-DD HH:mm").toString())
    solicitacaoFormData.append('material', solicitation.provideMaterial)
    solicitacaoFormData.append('endereco', solicitation.address)
    solicitacaoFormData.append('observacao', solicitation.observation)
    solicitacaoFormData.append('servicoId', solicitation.service.toString())
    solicitacaoFormData.append('urgente', solicitation.urgent)
    solicitacaoFormData.append('imovelId', solicitation.location)

    console.log('Image', imageList)

    let count = 0
    let promiseList: Array<Promise<any>> = [];

    imageList.forEach(imagePath => {
      count++
      let filePath = ''
      let fileName = ''

      console.log('Path: ', imagePath)

      const pathPromise = this.filePath.resolveNativePath('file://' + imagePath)

      console.log('Promisse', pathPromise)

      const promise = pathPromise.then(resolvedPath => {
        console.log('Resolved Patch', resolvedPath)
        filePath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/'))
        fileName = resolvedPath.substring(resolvedPath.lastIndexOf('/') + 1)

        return this.file.readAsArrayBuffer(filePath, fileName)
      })
      .then(data => {
        console.log('ArrayBuffer', data)
        const blobFile = new Blob([data], { type: "image/jpeg" })
        const random = Math.random() * 500;
        solicitacaoFormData.append(`image${random}`, blobFile, fileName)
      })

      promiseList.push(promise)
    })

    return Promise.all(promiseList)
      .then(() => Promise.resolve(solicitacaoFormData))
  }

  public remove(solicitationId) {
    const url = `${this.apiUrl}/solicitacao?id=${solicitationId}`
    const headers = { Authorization: `${this.userProvider.user.token}` }
    const params = HttpFactory.getRequestOptions(headers)
    const request: Observable<HttpEvent<any>> = this.http.delete<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

}
