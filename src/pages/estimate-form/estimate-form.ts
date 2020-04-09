import { Component } from '@angular/core';
import { 
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  LoadingController,
  normalizeURL,
  Platform,
  AlertController, 
  PopoverController,
  ActionSheetController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FeedbackUser } from '../../util/feedback-user';
import { ErrorChecker } from '../../util/error-checker';
import { EstimateProvider } from '../../providers/estimate/estimate';
import { UserProvider } from '../../providers/user/user';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { environment } from '../../environment/environment';
import { EstimateFormPopoverPage } from '../estimate-form-popover/estimate-form-popover';
import { DomSanitizer } from '@angular/platform-browser';
import { CollaboratorProvider } from '../../providers/collaborator/collaborator';

@IonicPage()
@Component({
  selector: 'page-estimate-form',
  templateUrl: 'estimate-form.html',
})
export class EstimateFormPage {
  public UserRoles = UserProvider.ROLES
  public colaboratorList = []

  public estimateForm: FormGroup
  private avaliationId
  private estimateId
  private solicitationId
  private hasMaterial
  private extraTax = []
  private imageList = [ ]
  private updateEstimate = false

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private camera: Camera,
    private domSanitizationService: DomSanitizer,
    private photoViewer: PhotoViewer,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private estimateProvider: EstimateProvider,
    private colaboratorProvider: CollaboratorProvider,
    private userProvider: UserProvider,
  ) {
    this.estimateForm = this.formBuilder.group({
      id: [],
      labor: [ , Validators.required ],
      material: [ , Validators.required ],
      observation: [ '', ],
      constructionJournal: [ '', ],
      deliveryDate: [ '', Validators.required ],
      finished: [ false, Validators.required ],
      paid: [ false, Validators.required ],
      solicitationId: [ , Validators.required ],
      estimateId: [ ],
      colaboratorList: [ [] ],
    })
  }

  ionViewWillEnter() {
    this.solicitationId = this.navParams.get('solicitationId')
    this.estimateId = this.navParams.get('estimateId')
    this.hasMaterial = this.navParams.get('hasMaterial')

    if(this.estimateId) this.estimateForm.controls.estimateId.setValue(this.estimateId)
    if(this.solicitationId) this.estimateForm.controls.solicitationId.setValue(this.solicitationId)
    if(this.hasMaterial) this.estimateForm.controls.material.setValue(0)

    this.getCollaborators()

    if(this.estimateId)
      this.initEstimateData()
  }
  
  showEmptyCreditCardAlert() {
    FeedbackUser.showAlert(
      this.alertCtrl,
      'Cartão de Crédito',
      'Você deve adicionar um cartão de crédito para realizar a confirmação',
      () => this.navCtrl.push('CreditCardListPage')
    )
  }

  getCollaborators(): any {
    this.colaboratorProvider.getAll()
      .then((data: any) => this.colaboratorList = data.usuario)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  initEstimateData() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados da solicitação...', dismissOnPageChange: true })
    
    loading.present()
    .then(() => this.estimateProvider.getEstimateById(this.estimateId))
    .then((data: any) => {
      this.estimateForm.controls.labor.setValue(data.orcamento.maoObra.toFixed(2))
      this.estimateForm.controls.material.setValue(data.orcamento.material.toFixed(2))
      this.estimateForm.controls.deliveryDate.setValue(data.orcamento.dataEntrega)
      this.estimateForm.controls.finished.setValue(data.orcamento.concluido)
      this.estimateForm.controls.paid.setValue(data.orcamento.pago)
      this.estimateForm.controls.observation.setValue(data.orcamento.observacao)
      this.estimateForm.controls.estimateId.setValue(this.estimateId)
      this.extraTax = data.orcamento.taxasExtras
      
      const colaboratorList = data.orcamento.usuarioCollaborador.map(item => item.id)
      this.estimateForm.controls.colaboratorList.setValue(colaboratorList)
      
      if(data.orcamento.diarioObra)
        this.estimateForm.controls.constructionJournal.setValue(data.orcamento.diarioObra)

      if(data.orcamento.avaliacaoId)
        this.avaliationId = data.orcamento.avaliacaoId

      this.imageList = []
      data.orcamento.imagem.forEach(imagem => this.imageList.push(`${environment.imageStorage}/${imagem.valor}`))
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  createEstimate() {
    if(ErrorChecker.getFormError(this.estimateForm.controls, this.toastCtrl).length > 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Criando orçamento...', dismissOnPageChange: true })
    loading.present()

    this.estimateProvider.postEstimate(this.estimateForm.value)
    .then((data: any) => {
      FeedbackUser.showMessage(this.toastCtrl, "Orçamento criado com sucesso")
      this.navCtrl.popToRoot()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  concludeEstimate() {
    if(ErrorChecker.getFormError(this.estimateForm.controls, this.toastCtrl).length > 0)
      return
      
    const loading = this.loadingCtrl.create({ content: 'Concluindo orçamento...', dismissOnPageChange: true })
    loading.present()

    this.estimateForm.controls.id.setValue(this.estimateId)
    this.estimateForm.controls.finished.setValue(true)

    const constructionJournal = this.estimateForm.value.constructionJournal

    this.estimateProvider.finishEstimate(this.estimateId, constructionJournal, this.imageList)
    .then((data: any) => {
      FeedbackUser.showMessage(this.toastCtrl, "Orçamento atualizado com sucesso")
      this.navCtrl.popToRoot()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  saveEstimate() {
    if(ErrorChecker.getFormError(this.estimateForm.controls, this.toastCtrl).length > 0)
    return

    const loading = this.loadingCtrl.create({ content: 'Salvando orçamento...', dismissOnPageChange: true })
    loading.present()

    this.estimateProvider.updateEstimate(this.estimateForm.value)
    .then((data: any) => {
      FeedbackUser.showMessage(this.toastCtrl, "Orçamento atualizado com sucesso")
      this.updateEstimate = false
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  handleImage(position) {
    (this.estimateId) ? this.photoViewer.show(this.imageList[position]) : this.removeImage(position)
  }

  selectImageSource() {
    if(this.estimateId)
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
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: sourceType,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options)
    .then(
      imageData => {
        if(this.platform.is('ios')) this.imageList.push(normalizeURL(imageData))
        else this.imageList.push(imageData)
      },
      err => ErrorChecker.getErrorMessage(err, this.toastCtrl)
    )
  }

  removeImage(index) {
    if(this.estimateId)
      return

    this.imageList.splice(index, 1)
    this.toastCtrl.create({
      message: 'Imagem removida com sucesso',
      duration: 4000,
      position: 'top'
    }).present()
  }

  showExtraTaxAlert() {
    this.alertCtrl.create({
      title: 'Taxa Extra',
      buttons: [
        { text: 'Adicionar', handler: (data) => this.addExtraTax(data) },
        { text: 'Cancelar', role: 'cancel' },
      ],
      inputs: [
        { name: 'extraTaxValue', placeholder: 'Taxa Extra', type: 'number' },
      ]
    }).present()
  }
  
  addExtraTax(value) {
    const loadingOptions = { content: 'Adicionando taxa extra...', dismissOnPageChange: true }
    const loading = this.loadingCtrl.create(loadingOptions)
    loading.present()

    this.estimateProvider.postExtraTax(this.estimateId, value.extraTaxValue)
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.Message)
        this.extraTax = [ data.taxa ]
      })
      .catch(error => ErrorChecker.getErrorMessage(error))
      .then(() => loading.dismiss())
  }

  presentPopover(event) {    
    const popover = this.popoverCtrl.create('EstimateFormPopoverPage')
    popover.present({ ev: event })
    popover.onDidDismiss(data => {
      if(data.action === EstimateFormPopoverPage.ACTION.CHANGE_TO_EDIT)
        this.changeFormToEdit()
    })
  }
  
  changeFormToEdit() {
    if(this.estimateForm.get('paid').value) {
      FeedbackUser.showMessage(this.toastCtrl, "Esse orçamento já foi confirmado e não pode ser alterado", 6000)
      return
    }

    this.updateEstimate = true
  }

}
