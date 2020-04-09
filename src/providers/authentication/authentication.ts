import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';

import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Push, PushOptions, PushObject } from '@ionic-native/push';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { UserProvider } from '../user/user';

import { environment } from '../../environment/environment';

import { HttpFactory } from '../../util/http-factory';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

@Injectable()
export class AuthenticationProvider {

  private apiUrl: string = environment.apiUrl
  private androidPermission = null

  constructor(
    public platform: Platform,
    public http: HttpClient,
    // public firebaseProvider: FCM,
    private push: Push,
    private facebook: Facebook,
    public alertCtlr: AlertController,
    public userProvider: UserProvider,
    public uniqueDeviceID: UniqueDeviceID,
    public androidPermissions: AndroidPermissions,
  ) {
    console.log('Hello AuthProvider Provider');
    this.androidPermission = this.androidPermissions.PERMISSION.READ_PHONE_STATE
  }

  public getData() {
    const url = `${this.apiUrl}/usuario/listar`
    const params = HttpFactory.getRequestOptions({ Authorization: this.userProvider.user.token })
    const request: Observable<HttpEvent<any>> = this.http.get<any>(url, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })

    return response
  }
  
  public signup(signupForm) {    
    const url = `${this.apiUrl}/usuario/cadastrar`
    const body = this.initSignupData(signupForm)
    const params = HttpFactory.getRequestOptions()
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  private initSignupData(signupForm) {
    const data = {
      dataAniversario: signupForm.dataAniversario,
      cpfCnpj: signupForm.cpfCnpj,
      email: signupForm.email,
      nome: signupForm.nome,
      telefone: signupForm.telefone,
      perfilId: 1,
      cep: signupForm.cep,
      endereco: signupForm.endereco,
      numero: signupForm.numero,
      uf: signupForm.uf,
      cidade: signupForm.cidade,
      tipoId: signupForm.perfilId
    }
    
    if(signupForm.password) data['senha'] = signupForm.password

    return JSON.stringify(data)
  }

  public updateData(signupForm) {
    const url = `${this.apiUrl}/usuario/atualizar`
    const body = this.initSignupData(signupForm)
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.put<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public updateAttribute(attrib, attribValue) {
    const url = `${this.apiUrl}/usuario/atualizar/atributo`
    
    const object = new Object
    object[attrib] = attribValue
    const body = JSON.stringify(object)

    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.put<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public updateAddress(address) {
    const url = `${this.apiUrl}/usuario/atualizar/atributo`
    const body = JSON.stringify(address)
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.put<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }
  
  public signin(email, password) {    
    const promise = this.getDeviceId().then(deviceID => {
      return this.getFcmToken().then(fcmToken => {
        const url = `${this.apiUrl}/login`
        const body = JSON.stringify({ email, senha: password, fcmToken })
        const params = HttpFactory.getRequestOptions({ 'Device': deviceID })
        const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)
    
        const response = new Promise((resolve, reject) => {
          request.subscribe(
            (data: any) => {
              const user = { token: data.token, profile: data.perfilId, id: data.usuarioId }
              this.userProvider.saveUserData(user).then(() => resolve(data))
            },
            error => reject(error))
        })

        return response
      })
    })

    return promise
  }

  public signinFacebook() {
    let deviceId = ''
    let fcmToken = ''

    return this.getDeviceId()
      .then(data => {
        deviceId = data
        return this.getFcmToken()
      })
      .then(data => {
        fcmToken = data
        return this.facebook.login(['public_profile', 'email'])
      })
      .then((res: FacebookLoginResponse) => {
        const url = `${this.apiUrl}/login/facebook`
        const body = JSON.stringify({ access_token: res.authResponse.accessToken, fcmToken: fcmToken })
        const params = HttpFactory.getRequestOptions({ 'Device': deviceId })
        const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)
    
        const response = new Promise((resolve, reject) => {
          request.subscribe(
            (data: any) => {
              const user = { token: data.token, profile: data.perfilId, id: data.usuarioId }
              this.userProvider.saveUserData(user).then(() => resolve(data))
            },
            error => reject(error))
        })

        return response    
      })
  }

  private getDeviceId() {
    let checkPermission = null
    let deviceId = null

    if(this.platform.is('mobileweb'))
      return deviceId = Promise.resolve('mobileweb')

    else if(this.platform.is('android'))
      checkPermission = this.androidPermissions.checkPermission(this.androidPermission)

    else
      checkPermission = Promise.resolve({ hasPermission: true })

    const promise = checkPermission.then(data => {
      if(data.hasPermission) {
        return deviceId = this.uniqueDeviceID.get()
      } else {
        this.showPermissionAlert()
        return Promise.reject({ message: 'O aplicativo não possui permissões suficientes' })
      }
    })

    return promise
  }

  private getFcmToken() {
    let fcmToken = null

    if(this.platform.is('mobileweb'))
      return fcmToken = Promise.resolve('mobileweb')
    else {
      this.push.init({}).on("registration").subscribe(data => console.log(data))
      return Promise.resolve('123')
    }
  }

  public updateFcmToken(fcmToken) {
    const promise = this.getDeviceId().then(deviceID => {
      const url = `${this.apiUrl}/acesso`
      const body = JSON.stringify({ fcmToken })
      const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}`, Device: deviceID })
      const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)
  
      const response = new Promise((resolve, reject) => {
        request.subscribe(
          data => resolve(data),
          error => reject(error))
      })
      
      return response
    })

    return promise
  }

  private showPermissionAlert() {
    this.alertCtlr.create({
      title: 'Identificação do dispositivo',
      message: 'Por questões de segurança precisamos identificar o seu dispositivo. Por favor habilite a permissão.',
      buttons: [
        { text: 'Agora não', role: 'cancel' },
        { text: 'Habilitar', handler: () =>  {this.androidPermissions.requestPermission(this.androidPermission)} },
      ]
    }).present()
  }

  public signout() {
    const url = `${this.apiUrl}/logout`
    const params = HttpFactory.getRequestOptions({ Authorization: this.userProvider.user.token })
    const body = JSON.stringify({})
    const request: Observable<HttpEvent<any>> = this.http.post<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request
        .finally(() => this.userProvider.eraseUserData())
        .subscribe(
          data => resolve(data),
          error => reject(error)
        )
    })
    
    return response
  }

  public changePassword({actualPassword, password}) {
    const url = `${this.apiUrl}/usuario/atualizarSenha`
    const body = JSON.stringify({ senhaAtual: actualPassword, novaSenha: password })
    const params = HttpFactory.getRequestOptions({ Authorization: `${this.userProvider.user.token}` })
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }

  public resetPassword(email) {
    const url = `${this.apiUrl}/recuperacaoSenha`
    const body = JSON.stringify({ email: email })
    const params = HttpFactory.getRequestOptions()
    const request: Observable<HttpEvent<any>> = this.http.patch<any>(url, body, params)

    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
    
    return response
  }
}
