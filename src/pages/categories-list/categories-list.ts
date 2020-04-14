import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { ServicesProvider } from '../../providers/services/services';
import { ErrorChecker } from '../../util/error-checker';
import { environment } from '../../environment/environment';

@IonicPage()
@Component({
  selector: 'page-categories-list',
  templateUrl: 'categories-list.html',
})
export class CategoriesListPage implements OnInit {

  public categorieList = []
  public filteredCategorieList = []
  public imageStorage = environment.imageStorage

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public servicesProvider: ServicesProvider,) {
  }

  ngOnInit() {
    
    this.getCategories()
    console.log('ionViewDidLoad CategoriesListPage');
  }

  ionViewWillEnter() {
    this.getCategories()
    console.log('ionViewDidLoad CategoriesListPage');
  }  

  //metodo de chamada anterior
  
  /*getCategories_() {
    
    const loading = this.loadingCtrl.create({ content: 'Obtendo categorias', dismissOnPageChange: true })
    
    loading.present()
      .then(() => {
        this.servicesProvider.getCategoriess()
      })
      .then((response: any) => {
        debugger
        this.categorieList = response.categoria
        this.filteredCategorieList = this.categorieList
      })
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }*/

  getCategories(){
   
      this.categorieList = [];
      this.servicesProvider.getCategories().subscribe((data) =>{
        for (let index = 0; index < data.categoria.length; index++) {
          
         let category = {
            id: Number(data.categoria[index]['id']),
            valor: data.categoria[index]['valor'],
            imagem: data.categoria[index]['imagem'],
            inativo: data.categoria[index]['inativo']
        }
        this.categorieList.push(category);
        }
      })
  
  
  }




  openServiceList(categoryId) {
    this.navCtrl.push('ServiceListPage', { categoryId: categoryId })
  }

  filterCategories(event) {
    const search = event.target.value.toLowerCase()
    if(search)
      this.filteredCategorieList = this.categorieList
        .filter(categorie => categorie.valor.toLowerCase().includes(search))
    else
      this.filteredCategorieList = this.categorieList
  }

}
