import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, InfiniteScroll, Refresher } from 'ionic-angular';
import { EstimateProvider } from '../../providers/estimate/estimate';
import { ErrorChecker } from '../../util/error-checker';

import { environment } from '../../environment/environment';

import moment from 'moment';
import { SolicitationDetailsPage } from '../solicitation-details/solicitation-details';

@IonicPage()
@Component({
  selector: 'page-estimate-list',
  templateUrl: 'estimate-list.html',
})
export class EstimateListPage {
  @ViewChild(InfiniteScroll) infiniteScroll : InfiniteScroll
  @ViewChild(Refresher) ionRefresher : Refresher

  public imageStorage = environment.imageStorage
  public estimateList
  public page

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public estimateProvider: EstimateProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EstimateListPage');
  }

  ionViewWillEnter() {
    this.page = 0
    this.estimateList = []
    this.infiniteScroll.enabled = true;
    this.getEstimates()
  }

  getEstimates() {
    this.page++

    this.estimateProvider.getEstimateList(this.page)
    .then((data: any) => {
      if(data.listaorcamento) {
        const estimates = data.listaorcamento.map(estimate => {
          estimate.dataServico = moment(estimate.dataServico).format("DD-MM-YYYY")
          estimate.duracao = moment(estimate.duracao).format("DD-MM-YYYY")
          estimate.status = this.getEstimateStatus(estimate)
          return estimate
        })
  
        if(data.listaorcamento.length == 0) {
          this.infiniteScroll.enabled = false
        } else {
          this.estimateList.push(...estimates)
        }
      }

      this.infiniteScroll.complete()
      this.ionRefresher.complete()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  getEstimateStatus(estimate) {
    if(!estimate.pago)
      return SolicitationDetailsPage.EstimateStatus.PendingConfirmation

    if(estimate.pago && !estimate.concluido)
      return SolicitationDetailsPage.EstimateStatus.WaitingEstimate

    if(estimate.pago && estimate.concluido && !estimate.avaliacao)
      return SolicitationDetailsPage.EstimateStatus.WaytingAvaliation

    if(estimate.pago && estimate.concluido && estimate.avaliacao)
      return SolicitationDetailsPage.EstimateStatus.Finished
  }

  openEstimateDetails(estimate) {
    const data = { estimateId: estimate.id, solicitationId: estimate.solicitacaoId }
    this.navCtrl.push('EstimateFormPage', data )
  }

}
