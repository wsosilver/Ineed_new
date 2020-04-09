import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  LoadingController,
  AlertController } from 'ionic-angular';

import { VisitProvider } from '../../providers/visit/visit';
import { UserProvider } from '../../providers/user/user';
import { SolicitationProvider } from '../../providers/solicitation/solicitation';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { CreditCardProvider } from '../../providers/credit-card/credit-card';
import { CollaboratorProvider } from '../../providers/collaborator/collaborator';

import { ErrorChecker } from '../../util/error-checker';
import { FeedbackUser } from '../../util/feedback-user';
import { CustomValidators } from '../../util/custom-validators';

import { RatingPage } from '../rating/rating';

import moment from 'moment'

@IonicPage()
@Component({
  selector: 'page-visit-form',
  templateUrl: 'visit-form.html',
})
export class VisitFormPage {
  private visitId
  private visitForm: FormGroup
  private solicitation
  private categorie
  private urgent
  private urgentVisitTax
  private serviceList = []
  private avaliationId
  private hasEstimate = false
  private colaboratorList = []

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private visitProvider: VisitProvider,
    private configProvider: ConfigurationProvider,
    private solicitationProvider: SolicitationProvider,
    private creditCardProvider: CreditCardProvider,
    private userProvider: UserProvider,
    private colaboratorProvider: CollaboratorProvider,
  ) {
    this.visitForm = this.formBuilder.group({
      visitId: [],
      solicitationId: [, Validators.required],
      colaboratorList: [ [] ],
      price: [, Validators.required],
      date: ['', Validators.compose([Validators.required, CustomValidators.afterOrEqualToday])],
      time: ['', Validators.compose([Validators.required, CustomValidators.beforeHour])],
      finished: [false, Validators.required],
      paid: [false, Validators.required],
      observation: ['',],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitFormPage');
  }

  ionViewWillEnter() {
    this.checkIsUrgent()
    this.getVisitData()
    this.getVisitTax()
    this.getCollaborators()
  }
  
  getCollaborators(): any {
    this.colaboratorProvider.getAll()
      .then((data: any) => this.colaboratorList = data.usuario)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  getVisitTax() {
    this.configProvider.get()
      .then((data: any) => this.urgentVisitTax = data.configuracao.taxaVisitasUrgentes)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  checkIsUrgent() {
    const solicitationId = this.navParams.get('solicitationId')

    this.solicitationProvider.getSolicitationById(solicitationId)
      .then((data: any) => {
        this.urgent = data.solicitacao.urgente

        const price = (data.solicitacao.urgente) ? this.urgentVisitTax.toFixed(2) : '0.00'
        this.visitForm.controls.price.setValue(price)

        const date = moment(data.solicitacao.dataInicial).format('YYYY-MM-DD').toString()
        this.visitForm.controls.date.setValue(date)

        const time = moment(data.solicitacao.dataInicial).format('HH:mm').toString()
        this.visitForm.controls.time.setValue(time)
      })
      .catch(error => ErrorChecker.getErrorMessage(error))
  }

  getVisitData() {
    const solicitationId = this.navParams.get('solicitationId')
    this.visitForm.controls.solicitationId.setValue(solicitationId)

    this.visitId = this.navParams.get('visitId') || null
    this.visitForm.controls.visitId.setValue(this.visitId)
    const loading = this.loadingCtrl.create({ content: 'Obtendo dados da visita', dismissOnPageChange: true })

    if(!this.visitId)
      return

    loading.present()
      .then(() => this.visitProvider.getVisitById(this.visitId))
      .then((data: any) => {
        this.solicitation = data.solicitacao
        this.hasEstimate = data.hasOrcamento
        this.categorie = data.solicitacao.servicoSolicitacao[0].servico.categoria
        this.serviceList = data.solicitacao.servicoSolicitacao.map(item => {
          return { nome: item.servico.nome, id: item.servico.id }
        })
        this.initFormData(data.visita)
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  initFormData(visit) {
    this.visitForm.controls.visitId.setValue(visit.id)
    this.visitForm.controls.solicitationId.setValue(visit.solicitacaoId)
    this.visitForm.controls.price.setValue(visit.valor.toFixed(2))
    this.visitForm.controls.finished.setValue(visit.concluida)
    this.visitForm.controls.paid.setValue(visit.pago)
    this.visitForm.controls.observation.setValue(visit.observacao)

    const colaboratorList = visit.usuarioCollaborador.map(item => item.id)
    this.visitForm.controls.colaboratorList.setValue(colaboratorList)

    const date = moment(visit.dataVisita).format('YYYY-MM-DD').toString()
    this.visitForm.controls.date.setValue(date)

    const time = moment(visit.dataVisita).format('HH:mm').toString()
    this.visitForm.controls.time.setValue(time)

    this.avaliationId = visit.avaliacaoId
  }

  scheduleVisit() {
    const errors = ErrorChecker.getFormError(this.visitForm.controls, this.toastCtrl)
    if(errors.length != 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Criando agendamento...', dismissOnPageChange: true })

    loading.present()
      .then(() => this.visitProvider.createVisit(this.visitForm.value))
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.popToRoot()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  concludeVisit() {
    const errors = ErrorChecker.getFormError(this.visitForm.controls, this.toastCtrl)
    if(errors.length != 0)
      return

    const loading = this.loadingCtrl.create({ content: 'Finalizando visita...', dismissOnPageChange: true })

    loading.present()
      .then(() => this.visitProvider.concludeVisit(this.visitId))
      .then((data: any) => {
        FeedbackUser.showMessage(this.toastCtrl, data.message)
        this.navCtrl.popToRoot()
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  createEstimate() {
    this.navCtrl.push('EstimateFormPage', {
      hasMaterial: this.solicitation.material,
      visitId: this.visitForm.controls.visitId.value,
      solicitationId: this.visitForm.controls.solicitationId.value
    })
  }

}
