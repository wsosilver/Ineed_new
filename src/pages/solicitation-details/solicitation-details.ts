import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';

import { RatingPage } from '../rating/rating';

import { SolicitationProvider } from '../../providers/solicitation/solicitation';
import { VisitProvider } from '../../providers/visit/visit';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';
import { EstimateProvider } from '../../providers/estimate/estimate';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { CupomProvider } from '../../providers/cupom/cupom';

import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';

import * as moment from 'moment';

declare var PagSeguroDirectPayment: any;

import { environment } from '../../environment/environment';

@IonicPage()
@Component({
  selector: 'page-solicitation-details',
  templateUrl: 'solicitation-details.html',
})
export class SolicitationDetailsPage {
  static ClassName = 'SolicitationDetailsPage'
  static Pages = { Visit: 'visit', Estimate: 'estimate' }
  static EstimateStatus = {
    Pending: 'Pendente',
    PendingConfirmation: 'Confirmação Pendente',
    ExtraTaxConfirmartion: 'Taxa Extra Pendente',
    WaitingEstimate: 'Aguardando Serviço',
    WaytingAvaliation: 'Aguardando Avaliação',
    Finished: 'Concluído'
  }
  static VisitStatus = {
    Pending: 'Pendente',
    PendingConfirmation: 'Confirmação Pendente',
    WaitingVisit: 'Aguardando Visita',
    WaytingAvaliation: 'Aguardando Avaliação',
    Finished: 'Concluída'
  }

  selectedPage = SolicitationDetailsPage.Pages.Visit
  solicitationId = null
  extraTax = []
  
  discountTax
  discountValue
  
  button = {
    enabled: false,
    name: '',
    action: ''
  }
  
  solicitationData = {
    categorie: '',
    services: [],
    address: ''
  }

  maxInstallments = [ 1 ]
  
  estimateData = {
    id: 0,
    paymentOption: null,
    status: SolicitationDetailsPage.EstimateStatus.Pending,
    labor: 0,
    creditCardId: null,
    creditCardList: [],
    material: 0,
    total: 0,
    installments: 1,
    observations: '',
    confirmed: false,
    finished: false,
    colaborators: [],
    transacao: null,
  }
  
  visitData = {
    id: 0,
    paymentOption: null,
    creditCardId: null,
    creditCardList: [],
    observations: '',
    status: SolicitationDetailsPage.VisitStatus.Pending,
    address: '',
    startDate: '',
    endDate: '',
    confirmed: false,
    urgentValue: null,
    colaborators: [],
    transacao: null,
  }

  paymentOptions = [
    { id: 1, name: 'Cartão de Crédito' },
    { id: 2, name: 'Boleto' },
  ]

  constructor(
    private cf: ChangeDetectorRef,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public configProvider: ConfigurationProvider,
    public creditCardProvider: CreditCardProvider,
    public solicitationProvider: SolicitationProvider,
    public visitProvider: VisitProvider,
    public cupomProvider: CupomProvider,
    public estimateProvider: EstimateProvider) {
  }

  ionViewWillEnter() {
    this.button = { enabled: false, name: '', action: '' }
    this.selectedPage = this.navParams.get('selectedPage') || SolicitationDetailsPage.Pages.Visit
    this.solicitationId = this.navParams.get('solicitationId')

    this.configProvider.get().then((data: any) => {
      this.maxInstallments = Array.from({length: data.configuracao.maximoParcelas}, (v, k) => k + 1)
    })

    this.getSolicitationData()
  }

  getSolicitationData() {
    if(!this.solicitationId)
      return

    const loading = this.loadingCtrl.create({ content: 'Obtendo informações...', dismissOnPageChange: true })
    loading.present()
    
    this.solicitationProvider.getSolicitationById(this.solicitationId)
      .then(data => this.initFormsData(data))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss())
  }

  initFormsData(data) {
    this.solicitationData.services = []
    this.solicitationData.address = data.solicitacao.endereco
    this.solicitationData.categorie = data.solicitacao.solicitacoes[0].servico.categoria.valor
    data.solicitacao.solicitacoes.forEach(item => this.solicitationData.services.push(item.servico.nome))


    if(data.visita)
      this.initVisitData(data.visita)

    if(data.orcamento)
      this.initEstimateData(data.orcamento)

    if(data.orcamento) {
      this.cupomProvider.getDiscount()
        .then((data: any) => {
          this.discountTax = (data.descontos.length) ? data.descontos[0].desconto : 0
          this.discountValue = (this.estimateData.total / 100 * this.discountTax).toFixed(2)
        })
        .catch(error => FeedbackUser.showMessage(this.toastCtrl, error))
    }
  }

  initVisitData(visit) {
    this.visitData.id = visit.id
    this.visitData.transacao = visit.transacao
    this.visitData.observations = visit.observacao
    this.visitData.startDate = moment(visit.solicitacao.dataInicial).format('DD/MM/YYYY [às] HH:mm')
    this.visitData.confirmed = visit.pago
    this.visitData.urgentValue = (visit.valor).toFixed(2)
    this.visitData.colaborators = visit.usuarioCollaborador.map(item => {
      item.imagemUrl = `${environment.imageStorage}/${item.imagemUrl}`
      return item
    })

    if(visit.requisicaoId) this.visitData.paymentOption = 1
    if(visit.transacaoId) this.visitData.paymentOption = 2

    this.initVisitStatus(visit)

    if(visit.valor > 0.00) this.getCreditCards()
  }

  showImage(image) {
    let win: any = window;
    return win.Ionic.WebView.convertFileSrc(image)  
  }

  initVisitStatus(visit) {
    if(!visit.pago) {
      this.visitData.status = SolicitationDetailsPage.VisitStatus.PendingConfirmation
      this.button = { enabled: true, name: 'Confirmar Visita', action: 'confirmVisit' }
    }

    if(visit.pago && visit.valor > 0 && visit.requisicao) {
      this.estimateData.creditCardList.push(visit.requisicao.cartao.number)
      this.visitData.creditCardId = visit.requisicao.cartaoId
    }
    
    if(visit.pago && !visit.concluida) {
      this.visitData.status = SolicitationDetailsPage.VisitStatus.WaitingVisit
      this.button.enabled = false
    }

    if(visit.pago && visit.concluida  && !visit.avaliacao) {
      this.visitData.status = SolicitationDetailsPage.VisitStatus.WaytingAvaliation
      this.button = { enabled: true, name: 'Avaliar Visita', action: 'rateVisit' }
    }

    if(visit.pago && visit.concluida && visit.avaliacao) {
      this.visitData.status = SolicitationDetailsPage.VisitStatus.Finished
      this.button.enabled = false
    }
  }

  initEstimateData(estimate) {
    this.estimateData.id = estimate.id
    this.estimateData.transacao = estimate.transacao
    this.estimateData.confirmed = estimate.pago
    this.estimateData.finished = estimate.concluido
    this.estimateData.labor = estimate.maoObra.toFixed(2)
    this.estimateData.material = estimate.material.toFixed(2)
    this.estimateData.observations = estimate.observacao
    this.estimateData.total = (estimate.maoObra != null && estimate.material != null)
      ? (estimate.maoObra + estimate.material).toFixed(2)
      : 0.00

    this.estimateData.installments = (estimate.requisicao) ? estimate.requisicao.parcela : ''
    this.estimateData.creditCardId = (estimate.requisicao) ? estimate.requisicao.cartaoId : null

    this.extraTax = estimate.taxasExtras

    this.estimateData.colaborators = estimate.usuarioCollaborador.map(item => {
      item.imagemUrl = `${environment.imageStorage}/${item.imagemUrl}`
      return item
    })

    if(estimate.requisicaoId) this.estimateData.paymentOption = 1
    if(estimate.transacaoId) this.estimateData.paymentOption = 2

    if(this.estimateData.confirmed && estimate.requisicao)
      this.creditCardProvider
      .getById(estimate.requisicao.cartaoId)
      .then((data: any) => this.estimateData.creditCardList.push(data.cartao))

    else if(this.estimateData.total > 0.00)
      this.getCreditCards()

    this.initEstimateStatus(estimate)
  }

  initEstimateStatus(estimate) {
    if(!estimate.pago) {
      this.estimateData.status = SolicitationDetailsPage.EstimateStatus.PendingConfirmation
      this.button = { enabled: true, name: 'Confirmar Orçamento', action: 'confirmEstimate' }
    }

    if(!estimate.pago && estimate.transacao) {
      this.button.enabled = false
    }

    if(estimate.pago && estimate.requisicao) {
      this.estimateData.creditCardList.push(estimate.requisicao.cartao.number)
      this.estimateData.creditCardId = estimate.requisicao.cartaoId
    }

    if(estimate.pago && !estimate.concluido) {
      this.estimateData.status = SolicitationDetailsPage.EstimateStatus.WaitingEstimate
      this.button.enabled = false
    }

    if(estimate.pago && !estimate.concluido && this.extraTax.length && !this.extraTax[0].pago) {
      this.estimateData.status = SolicitationDetailsPage.EstimateStatus.ExtraTaxConfirmartion
      this.button = { enabled: true, name: 'Visualizar Taxa Extra', action: 'showExtraTax' }
    }

    if(estimate.pago && estimate.concluido && !estimate.avaliacao) {
      this.estimateData.status = SolicitationDetailsPage.EstimateStatus.WaytingAvaliation
      this.button = { enabled: true, name: 'Avaliar Serviço', action: 'rateEstimate' }
    }

    if(estimate.pago && estimate.concluido && estimate.avaliacao) {
      this.estimateData.status = SolicitationDetailsPage.EstimateStatus.Finished
      this.button.enabled = this.visitData.status == SolicitationDetailsPage.VisitStatus.WaytingAvaliation
        ? true
        : false
    }
  }

  callAction() {
    switch (this.button.action) {
      case 'confirmVisit':
        this.confirmVisit()
        break;

      case 'rateVisit':
        this.rateVisit()
        break;

      case 'confirmEstimate':
        this.confirmEstimate()
        break;

      case 'rateEstimate':
        this.rateEstimate()
        break;
    
      case 'showExtraTax':
        this.showExtraTaxAlert()
        break;
    
      default:
        console.log('No action found!')
        break;
    }
  }

  confirmVisit() {
    // Pagamento via cartão
    if(this.visitData.paymentOption == 1)
      this.confirmVisitWithCreditCard()

    // Pagamento via boleto
    if(this.visitData.paymentOption == 2)
      this.confirmVisitWithPaymentSlip()

    else
      this.confirmVisitFree()
  }

  confirmVisitFree() {
    const loading = this.loadingCtrl.create({ content: 'Confirmando visita...' })
    const value = this.visitData.urgentValue

    loading.present()
      .then(() => this.visitProvider.confirmVisit(this.visitData.id, value, this.visitData.creditCardId))
      .then((data: any) => {
        this.initVisitData(data.visita)
        FeedbackUser.showMessage(this.toastCtrl, data.message)
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  confirmVisitWithCreditCard() {
    if(this.visitData.urgentValue > 0 && !this.visitData.creditCardId) {
      FeedbackUser.showMessage(this.toastCtrl, 'Você deve informar um cartão de crédito')
      return
    }

    const loading = this.loadingCtrl.create({ content: 'Confirmando visita...' })
    const value = this.visitData.urgentValue

    loading.present()
      .then(() => this.visitProvider.confirmVisit(this.visitData.id, value, this.visitData.creditCardId))
      .then((data: any) => {
        this.initVisitData(data.visita)
        FeedbackUser.showMessage(this.toastCtrl, data.message)
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  confirmVisitWithPaymentSlip() {
    const loading = this.loadingCtrl.create({ content: 'Gerando boleto de pagamento' })

    loading.present()
      .then(() => this.visitProvider.getSessionId())
      .then((data: any) => this.getSenderHash(data.code))
      .then(hash => this.visitProvider.confirmWithPaymentSlip(this.visitData.id, hash))
      .then((data: any) => this.showPaymentSlipMessage(data.transacao.paymentLink))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  getSenderHash(sessionId) {
    return new Promise((resolve, reject) => {
      PagSeguroDirectPayment.setSessionId(sessionId)
      PagSeguroDirectPayment.onSenderHashReady(response =>
        response.status === 'success' ? resolve(response.senderHash) : reject(response.message))
    })
  }

  showPaymentSlipMessage(url) {
    this.alertCtrl.create({
      title: `Novo Boleto`,
      message: `O boleto foi enviado para seu e-mail de cadastro. Abra o boleto clicando em continuar`,
      buttons: [
        { text: 'Continuar', handler: () => { window.open(url) } } ,
        { text: 'Fechar', role: 'cancel' }
      ]
    }).present()
  }

  rateVisit() {
    this.navCtrl.push('RatingPage', {
      id: this.visitData.id,
      type: RatingPage.ratings.VISIT
    })
  }

  getCreditCards() {
    this.creditCardProvider.get()
      .then((data: any) => {
        this.estimateData.creditCardList = data.cartao
        this.visitData.creditCardList = data.cartao
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  showEmptyCreditCardAlert() {
    FeedbackUser.showAlert(
      this.alertCtrl,
      'Cartão de Crédito',
      'Você deve adicionar um cartão de crédito para realizar a confirmação',
      () => this.navCtrl.push('CreditCardListPage'))
  }

  confirmEstimate() {
    // Pagamento via cartão
    if(this.estimateData.paymentOption == 1)
      this.confirmEstimateWithCreditCard()

    // Pagamento via boleto
    if(this.estimateData.paymentOption == 2)
      this.confirmEstimateWithPaymentSlip()
  }

  confirmEstimateWithCreditCard() {
    if(!this.estimateData.creditCardId) {
      FeedbackUser.showMessage(this.toastCtrl, 'Você deve informar um cartão de crédito')
      return
    }
  
    const installments = this.estimateData.installments
    const title = 'Confirmar orçamentos'
    const totalValue = this.estimateData.total - this.discountValue
    const message = `Sera realizada uma compra de ${installments}x de R$ ${(totalValue / installments).toFixed(2)}. Deseja continuar?`
    const handler = () => {
      const loading = this.loadingCtrl.create({ content: 'Confirmando orçamento...', dismissOnPageChange: true })
      loading.present()
      
      this.estimateProvider
      .confirmEstimate(this.estimateData.id, this.estimateData.creditCardId, installments, this.estimateData.total)
      .then((data: any) => {
        this.initEstimateData(data.orcamento)
        FeedbackUser.showMessage(this.toastCtrl, "Orçamento atualizado com sucesso")
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
    }

    FeedbackUser.showAlert(this.alertCtrl, title, message, handler)
  }

  confirmEstimateWithPaymentSlip() {
    const loading = this.loadingCtrl.create({ content: 'Gerando boleto de pagamento' })

    loading.present()
      .then(() => this.estimateProvider.getSessionId())
      .then((data: any) => this.getSenderHash(data.code))
      .then(hash => this.estimateProvider.confirmWithPaymentSlip(this.estimateData.id, hash))
      .then((data: any) => this.showPaymentSlipMessage(data.transacao.paymentLink))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  rateEstimate() {    
    this.navCtrl.push('RatingPage', {
      id: this.estimateData.id,
      type: RatingPage.ratings.ESTIMATE,
    })
  }

  segmentChanged() {
    this.cf.detectChanges();
  }

  showExtraTaxAlert() {
    const alert = this.alertCtrl.create()
    alert.setTitle('Taxa Extra')

    if(this.extraTax.length && !this.extraTax[0].pago) {
      alert.setMessage(`Ocorreu um emprevisto no seu serviço e foi 
        necessário adicionar uma taxa extra ao seu orçamento de R$ ${this.extraTax[0].valor}`)
      alert.addButton({ text: 'Pagar', handler: data => this.confirmExtraTax(data) })
      alert.addButton({ text: 'Cancelar', role: 'cancel' })
      this.estimateData.creditCardList.forEach(creditCard => {
        alert.addInput({ type: 'radio', label: `**** ${creditCard.number}`, value: creditCard.id })
      })
    } else {
      alert.setMessage(`Ocorreu um emprevisto no seu serviço e foi necessário 
        adicionar uma taxa extra ao seu orçamento de R$ ${this.extraTax[0].valor}. Sua taxa extra já foi paga`)
      alert.addButton({ text: 'Ok', role: 'cancel' })
    }
    
    alert.present()
  }

  confirmExtraTax(creditCardId) {
    const loading = this.loadingCtrl.create({ content: 'Confirmando taxa extra...', dismissOnPageChange: true })
    loading.present()

    this.estimateProvider.confirmExtraTax(this.extraTax[0].id, creditCardId)
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, "Taxa extra confirmada com sucesso")
        this.extraTax = [ data.taxa ]
      })
      .catch(error => ErrorChecker.getErrorMessage(error))
      .then(() => loading.dismiss())
  }

  cancelSolicitation() {
    this.solicitationProvider.remove(this.solicitationId)
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.pop()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  openCupomPage() {
    this.navCtrl.push('CupomPage')
  }

  checkPaymentMethod() {
    if(this.selectedPage == 'visit' && this.visitData.paymentOption == 1 && !this.visitData.creditCardList.length)
      this.showEmptyCreditCardAlert()
  }

}
