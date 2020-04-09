import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { UserProvider } from '../../providers/user/user';

import { ErrorChecker } from '../../util/error-checker';
import { ChangePasswordPage } from '../change-password/change-password';
import { StringFormatter } from '../../util/string-formatter';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  public profileForm : FormGroup;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public authProvider: AuthenticationProvider,
    public userProvider: UserProvider,
    public navParams: NavParams,
    public formBuilder: FormBuilder,) {
      this.initForm()
  }

  ionViewWillEnter() {
    this.getUserData()
  }

  initForm() {
    this.profileForm = this.formBuilder.group({
      id: [ null, Validators.required ],
      nome: [ '', Validators.required ],
      email: [ '', Validators.compose([ Validators.required, Validators.email ])],
      cpfCnpj: [ ],
      telefone: [ ],
      perfilId: [ 1 ],
      endereco: [ ],
      contaRedeSocial: [ ]
    })    
  }

  fillForm(user) {
    localStorage.setItem('ucpf', user.cpfCnpj)
    localStorage.setItem('utel', user.telefone)
    
    this.profileForm.get('id').setValue(user.id)
    this.profileForm.get('nome').setValue(user.nome)
    this.profileForm.get('email').setValue(user.email)
    this.profileForm.get('cpfCnpj').setValue(user.cpfCnpj)
    this.profileForm.get('telefone').setValue(user.telefone)
    this.profileForm.get('contaRedeSocial').setValue(user.contaRedeSocial)
    const endereco = StringFormatter.insertAddressNumber(user.endereco, user.numero, user.complemento)
    this.profileForm.get('endereco').setValue(endereco)
    this.profileForm.disable()
  }

  getUserData() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados...', dismissOnPageChange: true })
    loading.present()

    this.authProvider.getData()
      .then((data: any) => this.fillForm(data.usuario))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))

    loading.dismiss()
  }

  openAddressForm() {
    this.navCtrl.push('AddressFormPage')
  }

  openChangePasswordPage() {
    if(this.profileForm.get('contaRedeSocial').value === false)
      this.navCtrl.push(ChangePasswordPage)
  }

  openCrediCardListPage() {
    this.navCtrl.push('CreditCardListPage')
  }

  openDiscountPage() {
    this.navCtrl.push('CupomPage')
  }

  openEditAttribForm(attrib) {
    this.navCtrl.push('ProfileAttribPage', { attrib: attrib })
  }

  logout() {
    this.authProvider.signout()
  }

}
