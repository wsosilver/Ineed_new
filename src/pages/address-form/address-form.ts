import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular'
import { AddressProvider } from '../../providers/address/address';
import { FeedbackUser } from '../../util/feedback-user';
import { ErrorChecker } from '../../util/error-checker';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

@IonicPage()
@Component({
  selector: 'page-address-form',
  templateUrl: 'address-form.html',
})
export class AddressFormPage {
  private addressForm : FormGroup
  private metropolitanArea = [ "Fortaleza", "Maracanaú", "Eusébio", "Aquiraz", "Caucaia" ]
  private stateList = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE","PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ]

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private addressProvider: AddressProvider,
    private authProvider: AuthenticationProvider,
  ) {
    this.initForm()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddressFormPage');
  }

  initForm() {
    this.addressForm = this.formBuilder.group({
      cep: [ ],
      endereco: [ '' , Validators.required ],
      numero: [ '', Validators.required ],
      complemento: [ '' ],
      uf: [ '', Validators.required ],
      cidade: [ '', Validators.required ]
    })

    this.getUserData()
  }

  
  getUserData() {
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados...', dismissOnPageChange: true })
    loading.present()

    this.authProvider.getData()
      .then((data: any) => this.initializeForm(data.usuario))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))

    loading.dismiss()
  }

  initializeForm(usuario) {
    this.addressForm.get('cep').setValue(usuario.cep)
    this.addressForm.get('endereco').setValue(usuario.endereco)
    this.addressForm.get('numero').setValue(usuario.numero)
    this.addressForm.get('complemento').setValue(usuario.complemento)
    this.addressForm.get('uf').setValue(usuario.uf)
    this.addressForm.get('cidade').setValue(usuario.cidade)
  }

  getAddress() {
    if(!this.addressForm.controls.cep.value)
      return

    const loading = this.loadingCtrl.create({ content: 'Obtendo endereço', dismissOnPageChange: true })
    loading.present()

    this.addressProvider.getAddress(this.addressForm.controls.cep.value)
      .then((data: any) => {
        this.addressForm.controls.uf.setValue(data.uf)
        this.addressForm.controls.cidade.setValue(data.localidade)
        this.addressForm.controls.endereco.setValue(`${data.logradouro}, ${data.bairro}`)
      })
      .catch(error => FeedbackUser.showMessage(this.toastCtrl, 'Não foi possível encontrar o endereço.'))
      .then(() => loading.dismiss().catch(() => {}))
  }

  save() {
    if(this.addressForm.invalid)
      return

    if(!this.metropolitanArea.includes(this.addressForm.controls.cidade.value)) {
      FeedbackUser.showMessage(this.toastCtrl, 'Infelizmente sua cidade ainda não é atendida pela nossa equipe.')
      return
    }

    const loading = this.loadingCtrl.create({ content: 'Atualizando endereço...', dismissOnPageChange: true })
    loading.present()

    this.authProvider.updateAddress(this.addressForm.value)
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.pop()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

}
