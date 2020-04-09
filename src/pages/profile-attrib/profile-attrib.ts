import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { AuthenticationProvider } from '../../providers/authentication/authentication';

import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';

@IonicPage()
@Component({
  selector: 'page-profile-attrib',
  templateUrl: 'profile-attrib.html',
})
export class ProfileAttribPage {
  public attrib = 'attrib'
  public inputType = 'text'
  public brmasker = {}
  public attribForm : FormGroup;

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public authProvider: AuthenticationProvider) {
      this.attribForm = this.formBuilder.group({ attribValue: [ '', Validators.required ] })
  }

  ionViewDidLoad() {
    this.attrib = this.navParams.get('attrib')

    this.initInput()
  }

  initInput() {
    
    switch (this.attrib) {
      case 'telefone':
        this.inputType = 'tel'
        this.brmasker = { phone: true }
        this.attribForm.get('attribValue').setValidators([ Validators.required, Validators.maxLength(20) ])
        if (localStorage.getItem('utel') != null && localStorage.getItem('utel') != 'null')
          this.attribForm.get('attribValue').setValue(localStorage.getItem('utel'))
        break;

      case 'email':
        this.inputType = 'email'
        this.attribForm.get('attribValue').setValidators([ Validators.required,  Validators.email ])
        break;
        
      case 'cpfCnpj':
        this.inputType = 'tel'
        this.attrib = 'CPF ou CNPJ'
        this.brmasker = { person: true }
        this.attribForm.get('attribValue').setValidators([ Validators.required,  Validators.maxLength(20) ])
        if (localStorage.getItem('ucpf') != null && localStorage.getItem('ucpf') != 'null')
          this.attribForm.get('attribValue').setValue(localStorage.getItem('ucpf'))
        break;

      default:
        this.inputType = 'text'
        this.attribForm.get('attribValue').setValidators( Validators.required )
        break;
    }
  }

  update() {
    const errors = ErrorChecker.getFormError(this.attribForm.controls, this.toastCtrl)
    if(errors.length > 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Salvando alterações', dismissOnPageChange: true})
    loading.present()

    if (this.attrib == 'CPF ou CNPJ') {
      this.attrib = 'cpfCnpj';
    }

    this.authProvider.updateAttribute(this.attrib, this.attribForm.get('attribValue').value)
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.pop()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

}
