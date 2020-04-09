import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { ErrorChecker } from '../../util/error-checker';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
  private loginForm: FormGroup

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authProvider: AuthenticationProvider,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email]) ],
      password: ['', Validators.required]
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninPage');
    // this.tempInit();
  }

  login() {
    const errors = ErrorChecker.getFormError(this.loginForm.controls, this.toastCtrl)

    if(errors.length != 0)
      return
    
    const email = this.loginForm.controls.email.value
    const password = this.loginForm.controls.password.value
    
    const loading = this.createLoading('Realizando login...')
    loading.present()

    this.authProvider.signin(email, password)
    .then(data => this.navCtrl.setRoot(TabsPage))
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  createLoading(message) {
    return this.loadingCtrl.create({
      content: message,
      dismissOnPageChange: true
    })
  }

  openForgotPasswordPage() {
    this.navCtrl.push('ForgotPasswordPage')
  }
  
  tempInit() {
    this.loginForm.controls.email.setValue('filipe.braga@prolins.com.br');
    this.loginForm.controls.password.setValue('12345')
  }
}
