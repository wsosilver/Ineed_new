import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { ServicesProvider } from '../../providers/services/services';
import { ErrorChecker } from '../../util/error-checker';

@IonicPage()
@Component({
  selector: 'page-service-list',
  templateUrl: 'service-list.html',
})
export class ServiceListPage {
  categorie = {}
  serviceList = []
  selectedServiceList = []

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public servicesProvider: ServicesProvider) {
  }

  ionViewDidLoad() {
    const categoryId = this.navParams.get('categoryId')
    
    this.getCategorie()
    this.getServices(categoryId)
  }
  
  getCategorie() {
    const categorieId = this.navParams.get('categoryId')
    this.servicesProvider.getCategories()
      .then((data: any) => {
        const categorieIndex = data.categoria.findIndex(categoria => categoria.id == categorieId)
        this.categorie = data.categoria[categorieIndex]

        console.warn(this.categorie)
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
    }
    
  getServices(categoryId) {
    this.servicesProvider.getServices(categoryId)
      .then((data: any) => this.serviceList = data.servico)
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
  }

  addService(service) {
    const index = this.serviceList.findIndex(item => service.id == item.id)
    const selected = this.serviceList[index]['selected']

    if (selected)
      this.serviceList[index]['selected'] = false
    else
      this.serviceList[index]['selected'] = true

    this.selectedServiceList = this.serviceList.filter(service => service.selected)
  }

  openSolicitationForm() {
    if(!this.selectedServiceList.length)
      return
      
    this.navCtrl.push('SolicitationFormPage', {
      categorie: this.categorie,
      selectedService: this.selectedServiceList
    })
  }

}
