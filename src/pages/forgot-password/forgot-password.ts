import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { ErrorChecker } from '../../util/error-checker';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  
  private emailForm: FormGroup

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authProvider: AuthenticationProvider,
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email]) ],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }

  resetPassword() {
    const errors = ErrorChecker.getFormError(this.emailForm.controls, this.toastCtrl)

    if(errors.length > 0)
      return

    const email = this.emailForm.controls.email.value
    
    const loading = this.createLoading('Enviando solicitação...')
    loading.present()


    this.authProvider.resetPassword(email)
    .then((data: any) => {
      this.showMessage(data.message)
      this.navCtrl.pop()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  createLoading(message) {
    return this.loadingCtrl.create({
      content: message,
      dismissOnPageChange: true
    })
  }

  showMessage(message) {
    this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 3000
    }).present()
  }

}
