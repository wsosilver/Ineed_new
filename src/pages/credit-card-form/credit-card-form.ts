import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';
import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';

@IonicPage()
@Component({
  selector: 'page-credit-card-form',
  templateUrl: 'credit-card-form.html',
})
export class CreditCardFormPage {
  private creditCardForm : FormGroup;
  
  constructor(
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public creditCardProvider: CreditCardProvider
  ) {
    this.creditCardForm = this.formBuilder.group({
      customerName: [ '', Validators.required ],
      holder: [ '', Validators.required ],
      cardNumber: [ , Validators.required ],
      expirationMonth: [ , Validators.compose([ Validators.required, Validators.min(1), Validators.max(12) ]) ],
      expirationYear: [ , Validators.compose([ Validators.required, Validators.min(2018) ]) ],
      securityCode: [ , Validators.required ],
      cardTypeId: [ this.creditCardProvider.CREDIT_CARD_TYPES.CREDIT , Validators.required ]
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreditCardPage');
  }

  addCreditCard() {
    const errors = ErrorChecker.getFormError(this.creditCardForm.controls, this.toastCtrl)

    if(errors.length > 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Salvando cartão de crédito' })
    
    loading.present()
      .then(() => this.creditCardProvider.add(this.creditCardForm.value))
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.pop()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss())
  }

}
