import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, NavParams, IonicPage } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ErrorChecker } from '../../util/error-checker';
import { CustomValidators } from '../../util/custom-validators';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { UserProvider } from '../../providers/user/user';
import { UseTermsPage } from '../use-terms/use-terms';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  private signupForm : FormGroup;
  private personTypes = [
    { id: 1, nome: 'Pessoa Física' },
    { id: 2, nome: 'Pessoa Jurídica' },
  ]

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private authProvider: AuthenticationProvider,
    private userProvider: UserProvider
  ) {
    this.initForm()
  }
  
  initForm() {
    this.signupForm = this.formBuilder.group({
      nome: [ '', Validators.required ],
      email: [ '', Validators.compose([ Validators.required, Validators.email ])],
      emailConfirmation: [ '', Validators.compose([ Validators.required, Validators.email ])],
      cpfCnpj: [ ],
      tipoId: [],
      telefone: [ ],
      dataAniversario: [ ],
      perfilId: [ 1 ],
      contaRedeSocial: [ ],
      password: [ , Validators.required ],
      passwordConfirmation: [ , Validators.required ],
      useTerms: [ false , Validators.requiredTrue ]
    }, {
      validator: [ CustomValidators.matchPassword, CustomValidators.matchEmail]
    })
  }

  getUserData() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados...', dismissOnPageChange: true })
    loading.present()

    this.authProvider.getData()
    .then((data: any) => this.fillForm(data.usuario))
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  fillForm(user) {
    this.signupForm.controls.nome.setValue(user.nome)
    this.signupForm.controls.email.setValue(user.email)
    this.signupForm.controls.emailConfirmation.setValue(user.email)
    this.signupForm.controls.tipoId.setValue(user.tipoId)
    this.signupForm.controls.dataAniversario.setValue(user.dataAniversario)
    this.signupForm.controls.perfilId.setValue(user.perfilId)
    this.signupForm.controls.contaRedeSocial.setValue(user.contaRedeSocial)
  }

  showMessage(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    }).present()
  }

  send(){
    const errors = ErrorChecker.getFormError(this.signupForm.controls, this.toastCtrl)
    
    if(errors.length > 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Criando usuário...', dismissOnPageChange: true })
    loading.present()

    this.authProvider.signup(this.signupForm.value)
    .then((data: any) => {
      this.showMessage(data.message)
      this.navCtrl.pop()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss().catch(() => {}))
  }

  openUseTerms() {
    this.navCtrl.push(UseTermsPage.CLASS_NAME)
  }

}
