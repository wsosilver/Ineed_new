import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreditCardFormPage } from './credit-card-form';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';

@NgModule({
  declarations: [
    CreditCardFormPage,
  ],
  imports: [
    IonicPageModule.forChild(CreditCardFormPage),
  ],
  providers: [
    CreditCardProvider,
  ]
})
export class CreditCardFormPageModule {}
