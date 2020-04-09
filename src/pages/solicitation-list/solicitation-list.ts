import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, InfiniteScroll, Refresher, AlertController, ModalController } from 'ionic-angular';
import { SolicitationProvider } from '../../providers/solicitation/solicitation';
import { ErrorChecker } from '../../util/error-checker';

import moment from 'moment';
import { environment } from '../../environment/environment';
import { SolicitationDetailsPage } from '../solicitation-details/solicitation-details';
import { UserProvider } from '../../providers/user/user';
import { FeedbackUser } from '../../util/feedback-user';
import { SolicitationListFilterPage } from '../solicitation-list-filter/solicitation-list-filter';

@IonicPage()
@Component({
  selector: 'page-solicitation-list',
  templateUrl: 'solicitation-list.html',
})
export class SolicitationListPage {
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll
  @ViewChild(Refresher) ionRefresher: Refresher

  public filter = []
  public filterValue = []
  public showFirstLoadingSpinner = false

  public static SolicitationStatus = {
    CANCELED: 'Cancelado'
  }

  private imageStorage = environment.imageStorage
  public solicitationList
  public page

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public userProvider: UserProvider,
    public solicitationProvider: SolicitationProvider) {
  }

  ionViewDidLoad() {
    this.showFirstLoadingSpinner = true
  }

  ionViewWillEnter() {
    this.initScreen()
  }

  getSolicitations() {
    this.page++

    return this.solicitationProvider.getSolicitationList(this.page, true, this.filter, this.filterValue)
      .then((data: any) => {
        if (data.solicit) {
          const solicitations = data.solicit.map(solicitation => {
            solicitation.dataServico = moment(solicitation.dataInicial).format("DD/MM/YYYY")
            solicitation.horaServico = moment(solicitation.dataInicial).format("HH:mm")
            solicitation.horaFinalServico = moment(solicitation.dataFinal).format("HH:mm")
            solicitation.status = this.getSolicitationStatus(solicitation)
            return solicitation
          })

          if (data.solicit.length == 0) {
            this.infiniteScroll.enabled = false
          } else {
            this.solicitationList.push(...solicitations)
          }
        }

        this.infiniteScroll.complete()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => {
        this.ionRefresher.complete()
        this.showFirstLoadingSpinner = false
      })
  }

  openSolicitationDetails(solicitationId, solicitation) {
    if(!solicitation.ativo) {
      FeedbackUser.showMessage(this.toastCtrl, 'Solicitações canceladas não podem ser editadas')
      return
    }

    if(this.userProvider.user.profile == 1)
      this.navCtrl.push(SolicitationDetailsPage.ClassName, {
        solicitationId: solicitationId,
        categoryId: solicitation.servicoSolicitacao[0].servico.categoriaId
      })
    
    if(this.userProvider.user.profile == 2)
      this.navCtrl.push("SolicitationFormPage", {
        solicitationId: solicitationId,
        categoryId: solicitation.servicoSolicitacao[0].servico.categoriaId
      })
  }

  getSolicitationStatus(solicitation) {
    // Visit cycle verification
    if(!solicitation.ativo)
      return SolicitationListPage.SolicitationStatus.CANCELED

    if(!solicitation.visita)
      return SolicitationDetailsPage.VisitStatus.Pending

    if(!solicitation.visita.pago)
      return SolicitationDetailsPage.VisitStatus.PendingConfirmation
    
    if(solicitation.visita.pago && !solicitation.visita.concluida)
      return SolicitationDetailsPage.VisitStatus.WaitingVisit

    if(solicitation.visita.pago && solicitation.visita.concluida  && !solicitation.visita.avaliacao && !solicitation.orcamento)
      return SolicitationDetailsPage.VisitStatus.WaytingAvaliation

    if(solicitation.visita.pago && solicitation.visita.concluida && solicitation.visita.avaliacao && !solicitation.orcamento)
      return SolicitationDetailsPage.EstimateStatus.Pending

    // Estimate cycle verification
    if(solicitation.visita && !solicitation.orcamento)
      return SolicitationDetailsPage.EstimateStatus.Pending

    if(!solicitation.orcamento.pago) {
      return SolicitationDetailsPage.EstimateStatus.PendingConfirmation
    }
  
    if(solicitation.orcamento.pago &&
      !solicitation.orcamento.concluido &&
      solicitation.orcamento.taxasExtras.length &&
      !solicitation.orcamento.taxasExtras[0].pago)
        return SolicitationDetailsPage.EstimateStatus.ExtraTaxConfirmartion

    if(solicitation.orcamento.pago && !solicitation.orcamento.concluido)
      return SolicitationDetailsPage.EstimateStatus.WaitingEstimate
  
    if(solicitation.orcamento.pago && solicitation.orcamento.concluido && !solicitation.orcamento.avaliacao)
      return SolicitationDetailsPage.EstimateStatus.WaytingAvaliation
  
    if(solicitation.orcamento.pago && solicitation.orcamento.concluido && solicitation.orcamento.avaliacao)
      return SolicitationDetailsPage.EstimateStatus.Finished
  }

  getElementColor(element) {
    switch(element) {
      case 'Pendente':
        return '#b60707'; 
      case 'Aguardando Avaliação':
        return '#0770b6';
      case 'Confirmação Pendente':
        return '#580786';
      case 'Cancelado':
          return '#b60707';
      case 'Aguardando Serviço':
        return '#b65607';
      default:
        return '#07b670'
    }
  }

  initScreen() {
    this.page = 0
    this.solicitationList = []
    this.infiniteScroll.enabled = true
    this.showFirstLoadingSpinner = true

    this.getSolicitations()
  }

  showFilter() {
    const solicitationFilter = this.modalCtrl.create(SolicitationListFilterPage, {
      filter: this.filter,
      filterValue: this.filterValue
    })
    
    solicitationFilter.present()

    solicitationFilter.onDidDismiss(data => {
      this.filter = data.filter
      this.filterValue = data.filterValue
      this.initScreen()
    })
  }
}
