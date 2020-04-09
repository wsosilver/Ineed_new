import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, InfiniteScroll, Refresher } from 'ionic-angular';
import { VisitProvider } from '../../providers/visit/visit';
import { ErrorChecker } from '../../util/error-checker';
import moment from 'moment';
import { SolicitationDetailsPage } from '../solicitation-details/solicitation-details';
import { environment } from '../../environment/environment';

@IonicPage()
@Component({
  selector: 'page-visit-list',
  templateUrl: 'visit-list.html',
})
export class VisitListPage {
  @ViewChild(InfiniteScroll) infiniteScroll : InfiniteScroll
  @ViewChild(Refresher) ionRefresher : Refresher
  
  public imageStorage = environment.imageStorage
  public visitList
  public page

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public visitProvider: VisitProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitListPage');
  }

  ionViewWillEnter() {
    this.page = 0
    this.visitList = []
    this.infiniteScroll.enabled = true;
    this.getVisitList()
  }

  getVisitList() {
    this.page++

    this.visitProvider.getVisitList(this.page)
    .then((data: any) => {      
      if(data.visitas) {
        const visits = data.visitas.map(visit => {
          visit.dataVisita = moment(visit.dataVisita).format("DD-MM-YYYY HH[:]mm")
          visit.status = this.getVisitStatus(visit)
          return visit
        })
        
        if(data.visitas.length == 0) {
          this.infiniteScroll.enabled = false
        } else {
          this.visitList.push(...visits)
        }
      }

      this.infiniteScroll.complete()
      this.ionRefresher.complete()
    })
    .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  getVisitStatus(visit) {
    if(!visit.pago)
      return SolicitationDetailsPage.VisitStatus.PendingConfirmation
    
    if(visit.pago && !visit.concluida)
      return SolicitationDetailsPage.VisitStatus.WaitingVisit

    if(visit.pago && visit.concluida && !visit.avaliacao)
      return SolicitationDetailsPage.VisitStatus.WaytingAvaliation

    if(visit.pago && visit.concluida && visit.avaliacao)
      return SolicitationDetailsPage.VisitStatus.Finished
  }
  
  openVisitDetails(visit) {
    this.navCtrl.push('VisitFormPage', {
      visitId: visit.id,
      solicitationId: visit.solicitacaoId
    })
  }

}
