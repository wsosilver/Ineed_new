import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, InfiniteScroll, Refresher, ToastController, LoadingController } from 'ionic-angular';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';
import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';

@IonicPage()
@Component({
  selector: 'page-credit-card-list',
  templateUrl: 'credit-card-list.html',
})
export class CreditCardListPage {
  @ViewChild(InfiniteScroll) infiniteScroll : InfiniteScroll
  @ViewChild(Refresher) ionRefresher : Refresher
  
  public creditCardList = []
  public page

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public creditCardProvider: CreditCardProvider
  ) {
  }

  ionViewWillEnter() {
    this.page = 0
    this.creditCardList = []
    this.infiniteScroll.enabled = true;
    this.getCreditCards()
  }

  getCreditCards() {
    this.page++

    this.creditCardProvider.get(this.page)
    .then((data: any) => {
      if(data.cartao) {  
        if(data.cartao.length == 0) {
          this.infiniteScroll.enabled = false
        } else {
          this.creditCardList.push(...data.cartao)
        }
      }

      this.infiniteScroll.complete()
      this.ionRefresher.complete()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  removeCreditCard(creditCardId) {    
    const loading = this.loadingCtrl.create({ content: 'Removendo cartão '})
    
    loading.present()
    .then(() => this.creditCardProvider.delete(creditCardId))
    .then((data: any) => {
        const creditCardIndex = this.creditCardList.findIndex(card => card.id == creditCardId)
        this.creditCardList.splice(creditCardIndex, 1)
        FeedbackUser.showMessage(this.toastCtrl, data.message)
      })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    .then(() => loading.dismiss())
  }

  openAddCreditCardPage() {
    this.navCtrl.push('CreditCardFormPage')
  }

}
