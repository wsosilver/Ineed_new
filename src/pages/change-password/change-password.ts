import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { ErrorChecker } from '../../util/error-checker';
import { CustomValidators } from '../../util/custom-validators';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {
  
  private changePasswordForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public authProvider: AuthenticationProvider
  ) {
    this.changePasswordForm = this.formBuilder.group({
      actualPassword: [ '', Validators.required ],
      password: [ '', Validators.required ],
      passwordConfirmation: [ '', Validators.required ],
    }, {
      validator: [ CustomValidators.matchPassword ]
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePasswordPage');
  }

  update() {
    if(this.changePasswordForm.invalid) {
      ErrorChecker.getFormError(this.changePasswordForm.controls, this.toastCtrl)
      return
    }

    const loading = this.loadingCtrl.create({ content: 'Trocando senha', dismissOnPageChange: true })
    loading.present()

    this.authProvider.changePassword(this.changePasswordForm.value)
    .then((response: any) => {
      this.navCtrl.pop()
      this.showMessage(response.message)
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  showMessage(message) {
    this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 3000
    }).present()
  }

}
