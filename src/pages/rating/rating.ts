import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { VisitProvider } from '../../providers/visit/visit';
import { EstimateProvider } from '../../providers/estimate/estimate';
import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';

import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-rating',
  templateUrl: 'rating.html',
})
export class RatingPage {
  static ratings = { VISIT: 'visit', ESTIMATE: 'estimate' }
  ratingType
  rateValue = 0
  solicitation = {
    date: '',
    categorie: '',
    serviceList: [ { name: 'Manutenção' } ],
    address: ''
  }

  constructor(
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public visitProvider: VisitProvider,
    public estimateProvider: EstimateProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RatingPage');
  }

  ionViewWillEnter() {
    this.ratingType = this.navParams.get('type')

    if(this.ratingType)
      this.getSolicitationInfo()
  }

  getSolicitationInfo() {
    const id = this.navParams.get('id')
    let solicitationPromise: Promise<any> = null

    if(!id)
      return

    if(this.ratingType == RatingPage.ratings.VISIT)
      solicitationPromise = this.visitProvider.getVisitById(id)
        .then((data: any) => this.initSolicitationData(data.visita))

    if(this.ratingType == RatingPage.ratings.ESTIMATE)
      solicitationPromise = this.estimateProvider.getEstimateById(id)
        .then((data: any) => this.initSolicitationData(data.orcamento))

    const loading = this.loadingCtrl.create({ content: 'Obtendo solicitação...' })
    loading.present()

    solicitationPromise      
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss())
  }

  initSolicitationData(data) {
    if(this.ratingType == RatingPage.ratings.VISIT)
      this.solicitation.date = moment(data.dataVisita).locale("pt-BR").format('DD [de] MMMM [de] YYYY')
    if(this.ratingType == RatingPage.ratings.ESTIMATE)
      this.solicitation.date = moment(data.dataEntrega).locale("pt-BR").format('DD [de] MMMM [de] YYYY')

    this.solicitation.address = data.solicitacao.endereco
    this.solicitation.categorie = data.solicitacao.servicoSolicitacao[0].servico.categoria.valor

    this.solicitation.serviceList = []
    data.solicitacao.servicoSolicitacao.forEach(item => this.solicitation.serviceList.push(item.servico))
  }

  setRating() {
    const id = this.navParams.get('id')
    const loading = this.loadingCtrl.create({ content: 'Enviando avaliação...' })
    
    if(this.ratingType == RatingPage.ratings.VISIT)
      loading.present()
        .then(() => this.visitProvider.rateVisit(id, this.rateValue))
        .then((data: any) => {
          FeedbackUser.showMessage(this.toastCtrl, data.message)
          this.navCtrl.pop()
        })
        .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl ))
        .then(() => loading.dismiss().catch(() => {}))
    else if(this.ratingType == RatingPage.ratings.ESTIMATE)
      loading.present()
        .then(() => this.estimateProvider.rateVisit(id, this.rateValue))
        .then((data: any) => {
          FeedbackUser.showMessage(this.toastCtrl, data.message)
          this.navCtrl.pop()
        })
        .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl ))
        .then(() => loading.dismiss().catch(() => {}))
  }

}
