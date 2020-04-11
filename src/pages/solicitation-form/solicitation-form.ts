import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import {
  IonicPage, 
  NavController, 
  NavParams,
  ToastController,
  LoadingController,
  AlertController,
  normalizeURL,
  Platform, 
  ActionSheetController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { ServicesProvider } from '../../providers/services/services';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { SolicitationProvider } from '../../providers/solicitation/solicitation';
import { UserProvider } from '../../providers/user/user';

import { StringFormatter } from '../../util/string-formatter';
import { FeedbackUser } from '../../util/feedback-user';
import { ErrorChecker } from '../../util/error-checker';
import { CustomValidators } from '../../util/custom-validators';

import { environment } from '../../environment/environment';

import { isArray } from 'util';
import moment from 'moment'

@IonicPage()
@Component({
  selector: 'page-solicitation-form',
  templateUrl: 'solicitation-form.html',
})
export class SolicitationFormPage {
  static ClassName = 'SolicitationFormPage'
  
  private USER_ROLES = UserProvider.ROLES

  private isResumed = false

  private solicitationForm: FormGroup
  private categorie
  private serviceList = []
  private user
  private imageList = [ ]
  private solicitationId
  private schedule
  private estimate
  private visitTax
  private clientData = { name: '', tel: '' }
  private locationTypes = [
    { id: 1, name: 'Apartamento' },
    { id: 2, name: 'Casa' },
    { id: 3, name: 'Ponto Comercial' },
  ]

  constructor(
    private platform: Platform,
    private camera: Camera,
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private photoViewer: PhotoViewer,
    private domSanitizationService: DomSanitizer,
    private userProvider: UserProvider,
    private storage: Storage,
    private configProvider: ConfigurationProvider,
    private servicesProvider: ServicesProvider,
    private solicitationProvider: SolicitationProvider,
    private authProvider: AuthenticationProvider) {
      this.initForm()
  }

  ionViewWillEnter() {
    this.solicitationId = this.navParams.get('solicitationId');
    
    this.configProvider.get().then((data: any) => {
      this.visitTax = data.configuracao.taxaVisitasUrgentes
      if(this.navParams.get('solicitationResumed')) {
        this.isResumed = true
        this.loadImageData()
        this.loadStoredSolicitationData()
      }
      
      if(this.solicitationId) {
        this.initSolicitationData()
      } else {
        this.getUserData()
        this.getServices()
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SolicitationFormPage');
  }

  initForm() {
    this.solicitationForm = this.formBuilder.group({
      service: [ , Validators.required ],
      address: [ '', Validators.required ],
      startDate: [ '', Validators.compose([ Validators.required, CustomValidators.beforeToday ]) ],
      startTime: [ '', Validators.compose([ Validators.required ]) ],
      finishTime: [ '', Validators.required ],
      urgent: [ false ] ,
      provideMaterial: [ false , Validators.required ],
      location: [ 1 , Validators.required ],
      observation: [ '', Validators.required],
    })

    //, { validator: [ CustomValidators.beforeTime, CustomValidators.minTimeDiff ] }

    this.solicitationForm.get('startDate').valueChanges.subscribe(() => this.checkIsUrgent())
    this.solicitationForm.get('startTime').valueChanges.subscribe(() => this.checkIsUrgent())
  }
  
  checkIsUrgent() {
    const date = this.solicitationForm.get('startDate').value
    const time = this.solicitationForm.get('startTime').value
    const datetime = (date && time) ? moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm') : null
    const minTimeDiff = moment().add('24', 'hours')
  
    if(datetime && datetime.isValid() && datetime.isBefore(minTimeDiff)) {
      if(!this.solicitationForm.get('urgent').value && (!this.solicitationId || !this.isResumed))
        this.showUrgentAlert()

      this.solicitationForm.get('urgent').setValue(true)
    } else {
      this.solicitationForm.get('urgent').setValue(false)
    }
  }

  initSolicitationData() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados da solicitação...', dismissOnPageChange: true })
    
    loading.present()
    .then(() => this.solicitationProvider.getSolicitationById(this.solicitationId))
    .then((data: any) => {
      this.solicitationForm.controls.urgent.setValue(data.solicitacao.urgente)
      this.solicitationForm.controls.provideMaterial.setValue(data.solicitacao.fornecerMaterial)
      this.solicitationForm.controls.location.setValue(data.solicitacao.imovelId)

      this.clientData.name = data.solicitacao.usuario.nome
      this.clientData.tel = data.solicitacao.usuario.telefone

      this.categorie = data.solicitacao.solicitacoes[0].servico.categoria
      this.serviceList = data.solicitacao.solicitacoes.map(item => {
        return { nome: item.servico.nome, id: item.servico.id }
      })

      const serviceIds = (this.serviceList) ? this.serviceList.map(service => service.id ) : []
      this.solicitationForm.controls.service.setValue(serviceIds)
      
      const startDate = moment(data.solicitacao.dataInicial).format('YYYY-MM-DD').toString()
      this.solicitationForm.controls.startDate.setValue(startDate)

      const startTime = moment(data.solicitacao.dataInicial).format('HH:mm').toString()
      this.solicitationForm.controls.startTime.setValue(startTime)

      const finishTime = moment(data.solicitacao.dataFinal).format('HH:mm').toString()
      this.solicitationForm.controls.finishTime.setValue(finishTime)

      this.solicitationForm.controls.address.setValue(data.solicitacao.endereco)
      this.solicitationForm.controls.provideMaterial.setValue(data.solicitacao.material)
      this.solicitationForm.controls.observation.setValue(data.solicitacao.observacao)

      this.imageList = []
      data.solicitacao.imagem.forEach(imagem => this.imageList.push(`${environment.imageStorage}/${imagem.valor}`))

      data.solicitacao.solicitacoes.forEach(service => {
        const serviceList = [ service.servicoId ]
        serviceList.push(...this.solicitationForm.controls.service.value)
        this.solicitationForm.controls.service.setValue(serviceList)
      })

      this.schedule = (data.visita) ? data.visita : null
      this.estimate = (data.orcamento) ? data.orcamento : null
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  getUserData() {
    this.authProvider.getData()
      .then((data: any) => {
        this.user = data.usuario
        if(this.checkUserData()) {
          const streetName = StringFormatter.insertAddressNumber(data.usuario.endereco, data.usuario.numero, data.usuario.complemento)
          const address = `${streetName}, ${data.usuario.cidade}, ${data.usuario.uf}`
          this.solicitationForm.controls.address.setValue(address)
        }
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  checkUserData() {
    if(this.userProvider.user.profile == UserProvider.ROLES.PROVIDER)
      return true
    else if (this.user.cidade && this.user.endereco && this.user.numero && this.user.uf && this.user.telefone && this.user.cpfCnpj) {
      return true
    } else {
      this.showIncompleteProfileAlert()
      return false
    }
  }

  getServices() {
    this.categorie = this.navParams.get('categorie')
    this.serviceList = this.navParams.get('selectedService')

    const serviceIds = (this.serviceList) ? this.serviceList.map(service => service.id ) : []
    this.solicitationForm.controls.service.setValue(serviceIds)
  }

  handleImage(position) {
    (this.solicitationId) ? this.photoViewer.show(this.imageList[position]) : this.removeImage(position)
  }

  selectImageSource() {
    if(this.solicitationId)
      return

    this.actionSheetCtrl.create({
      title: 'Escolha a origem',
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Galeria',
          icon: 'images',
          handler: () => { this.getImage(this.camera.PictureSourceType.SAVEDPHOTOALBUM) }
        },
        {
          text: 'Câmera',
          icon: 'camera',
          handler: () => { this.getImage(this.camera.PictureSourceType.CAMERA) }
        }
      ]
    }).present()
  }
  
  getImage(sourceType: number) {
    const options: CameraOptions = {
      quality: 25,
      targetHeight: 200,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: sourceType,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.saveSolicitationData()
      .then(() => this.camera.getPicture(options))
      .then(
        imageData => {
          if(imageData === 'No Image Selected')
            return

          if(this.platform.is('ios')) {
            this.imageList.push(normalizeURL(imageData))
            this.saveImage(normalizeURL(imageData))
          } else {
            this.imageList.push(imageData)
            this.saveImage(imageData)
          }
        },
        err => ErrorChecker.getErrorMessage(err, this.toastCtrl)
      )
  }

  showImage(image) {
    let win: any = window;
    return win.Ionic.WebView.convertFileSrc(image)  
  }

  //#region Prevents lost data on app resumo after getImage()

  saveImage(imageData) {
    this.storage.get('imageData').then(data => {
      if(data && isArray(data)) {
        data.push(imageData)
        this.storage.set('imageData', data)
      } else {
        this.storage.set('imageData', [ imageData ])
      }
    })
  }

  loadImageData() {
    this.storage.get('imageData')
      .then(data => {
        this.imageList = (data && isArray(data)) ? data : []
        
        const imageData = this.navParams.get('image')
        
        this.saveImage(imageData)
    
        if(this.platform.is('ios'))
          this.imageList.push(normalizeURL(imageData))
        else
          this.imageList.push(imageData)
      })
  }

  eraseStoredImages(index = null) {
    if(index)
      this.storage.get('imageData').then(data => {
        data.splice(index, 1)
        this.storage.set('imageData', data)
      })
    else
      this.storage.remove('imageData')
  }

  saveSolicitationData() {
    return this.storage.set('solicitationData', this.solicitationForm.value)
  }

  loadStoredSolicitationData() {
    const restoredData = this.navParams.get('solicitationForm')

    this.solicitationForm.controls.provideMaterial.setValue(restoredData.provideMaterial)
    this.solicitationForm.controls.location.setValue(restoredData.location)
    this.solicitationForm.controls.startDate.setValue(restoredData.startDate)
    this.solicitationForm.controls.startTime.setValue(restoredData.startTime)
    this.solicitationForm.controls.finishTime.setValue(restoredData.finishTime)
    this.solicitationForm.controls.address.setValue(restoredData.address)
    this.solicitationForm.controls.provideMaterial.setValue(restoredData.provideMaterial)
    this.solicitationForm.controls.observation.setValue(restoredData.observation)
    this.solicitationForm.controls.service.setValue(restoredData.service)
    this.solicitationForm.controls.urgent.setValue(restoredData.urgent)
  }

  //#endregion

  removeImage(index) {
    if(this.solicitationId)
      return

    this.eraseStoredImages(index)
    this.imageList.splice(index, 1)
    this.toastCtrl.create({
      message: 'Imagem removida com sucesso',
      duration: 4000,
      position: 'top'
    }).present()
  }

  createSolicitation() {
    debugger
    if(!this.checkUserData())
      return

    if(ErrorChecker.getFormError(this.solicitationForm.controls, this.toastCtrl).length > 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Criando solicitação...', dismissOnPageChange: true })
    loading.present()

    this.solicitationProvider.postSolicitation(this.solicitationForm.value, this.imageList)
    .then((data: any) => {
      FeedbackUser.showMessage(this.toastCtrl, "Solicitação criada com sucesso")
      this.navCtrl.popToRoot()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => {
      this.eraseStoredImages()
      loading.dismiss().catch(() => {})
    })
  }

  scheduleVisit() {
    this.navCtrl.push('VisitFormPage', {
      solicitationId: this.solicitationId,
      visitMinimumDate: this.solicitationForm.controls.startDate.value
    })
  }

  openVisitDetails() {
    this.navCtrl.push('VisitFormPage', {
      solicitationId: this.solicitationId,
      visitId: this.schedule.id,
      visitMinimumDate: this.solicitationForm.controls.startDate.value,
    })
  }

  openEstimateDetails() {
    this.navCtrl.push('EstimateFormPage', {
      visitId: this.schedule.id,
      solicitationId: this.solicitationId,
      estimateId: this.estimate.id
    })
  }

  showIncompleteProfileAlert() {
    this.alertCtrl.create({
      title: 'Perfil incompleto',
      message: 'Percebemos que as suas informações estão incompletas. Precisamos dos seus dados para criar a solicitação. Deseja preencher os dados agora?',
      buttons: [
        { text: 'Não' },
        { text: 'Vamos lá!', handler: () => this.navCtrl.parent.select(2) },
      ]
    }).present()
  }

  showUrgentAlert() {
    if(this.userProvider.user.profile !== this.USER_ROLES.USER)
      return

    this.alertCtrl.create({
      title: 'Solicitações urgente',
      message: `Visitas agendadas para um período inferior a 24 horas recebem uma taxa extra de urgência no valor de R$ ${this.visitTax.toFixed(2)} pagas na confirmação do agendamento.`,
      buttons: [ 'Ok' ]
    }).present()
  }

  setAsProvideMaterial() {
    if(this.solicitationForm.controls.provideMaterial.value)
      FeedbackUser.showAlert(
        this.alertCtrl,
        'Fornecer material',
        'O iNeed não se responsabiliza por materiais fornecidos por terceiros'
      )
  }

  initFormDateToday() {
    const now = moment().add(130, 'minutes')
    
    this.solicitationForm.controls.startDate.setValue(now.format('YYYY-MM-DD').toString())
    this.solicitationForm.controls.startTime.setValue(now.format('HH:mm').toString())
  }

  clearFormDate() {
    this.solicitationForm.controls.startDate.setValue(null)
    this.solicitationForm.controls.startTime.setValue(null)
  }
}
