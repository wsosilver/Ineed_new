import { Component } from '@angular/core'

import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular'

import { SocialSharing } from '@ionic-native/social-sharing'

import { CupomProvider } from '../../providers/cupom/cupom'

import { FeedbackUser } from '../../util/feedback-user'
import { ErrorChecker } from '../../util/error-checker'

@IonicPage()
@Component({
  selector: 'page-cupom',
  templateUrl: 'cupom.html',
})
export class CupomPage {
  userDiscountCode = ''
  sharedDiscountCode = ''

  constructor(
    public cupomProvider: CupomProvider,
    public socialSharing: SocialSharing,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
    this.getUserDiscountCode()
    
    this.sharedDiscountCode = this.navParams.get('code')

    if(this.sharedDiscountCode)
      this.activateDiscount()
  }

  shareDiscount() {
    const message = `Venha conhecer o iNeed Service. Utilize o cupom ${this.userDiscountCode} para obter desconto na sua próxima solicitação`
    const url = `http://ineedservice.com.br/discount/${this.userDiscountCode}`

    this.socialSharing.share(message, null, null, url)
      .catch(error => FeedbackUser.showMessage(this.toastCtrl, error))
  }

  getUserDiscountCode() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados', dismissOnPageChange: true })
    loading.present()

    this.cupomProvider.getUserDiscountCode()
      .then((data: any) => this.userDiscountCode = data.cupom.codigo)
      .catch(response => ErrorChecker.getErrorMessage(response, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  activateDiscount() {
    const loading = this.loadingCtrl.create({ content: 'Ativando cupom', dismissOnPageChange: true })
    loading.present()

    this.cupomProvider.activate(this.sharedDiscountCode)
      .then((data: any) => FeedbackUser.showMessage(this.toastCtrl, data.message))
      .catch(response => ErrorChecker.getErrorMessage(response, this.toastCtrl))
      .then(() => {
        this.sharedDiscountCode = ''
        loading.dismiss().catch(() => {})
      })
  }

}
