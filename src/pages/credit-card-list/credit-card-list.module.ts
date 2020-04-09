import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreditCardListPage } from './credit-card-list';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';

@NgModule({
  declarations: [
    CreditCardListPage,
  ],
  imports: [
    IonicPageModule.forChild(CreditCardListPage),
  ],
  providers: [
    CreditCardProvider
  ]
})
export class CreditCardListPageModule {}
