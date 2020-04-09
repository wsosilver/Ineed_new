import { Component } from '@angular/core';
import { ViewController, ToastController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesProvider } from '../../providers/services/services';
import { ErrorChecker } from '../../util/error-checker';

@Component({
  selector: 'page-solicitation-list-filter',
  templateUrl: 'solicitation-list-filter.html',
})
export class SolicitationListFilterPage {
  filterForm: FormGroup

  serviceList = []
  categorieList = []

  constructor(
    public navParms: NavParams,
    public formBuilder: FormBuilder,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public servicesProvider: ServicesProvider) {
      this.initForm()
  }

  ionViewDidLoad() {
    this.getCategories()
  }

  ionViewWillEnter() {
    this.initFormData()
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      id: [ null , Validators.required ],
      dataMinima: [ null , Validators.required ],
      dataMaxima: [ null , Validators.required ],
      nomeCliente: [ null, Validators.required ],
      endereco: [ null , Validators.required ],
      servicoId: [ null , Validators.required ],
      categoriaId: [ null , Validators.required ],
      exibirCancelados: [ null , Validators.required ],
      exibirConcluidos: [ null , Validators.required ],
    })
  }

  initFormData() {
    const filter = this.navParms.get('filter')
    const filterValue = this.navParms.get('filterValue')

    for (let index = 0; index < filter.length; index++) {
      const filterName = filter[index];
      this.filterForm.get(filterName).setValue(filterValue[index])
    }
  }

  getCategories() {
    this.servicesProvider.getCategories()
      .then((data: any) => this.categorieList = data.categoria)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  getServices() {
    const categoryId = this.filterForm.get('categoryId').value
    
    this.servicesProvider.getServices(categoryId)
      .then((data: any) => this.serviceList = data.servico)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  filter() {
    const formValues = this.filterForm.value
    const filter = []
    const filterValue = []

    Object.keys(formValues).forEach(item => {
      if(formValues[item] !== null) {
        filter.push(item)
        filterValue.push(formValues[item])
      }
    })

    this.viewCtrl.dismiss({ filter, filterValue })
  }

  cancel() {
    this.viewCtrl.dismiss({ filter: [], filterValue: [] })
  }

}
