  import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';

import { UserProvider } from '../../providers/user/user';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  updateProfileParams = { function: 'update' }
  categoriesTabIndex = 0
  tabsList: Array<any> = [
    { page: 'CategoriesListPage', name: 'Serviços', icon: 'hammer', params: null, action: () => {} },
    { page: 'SolicitationListPage', name: 'Solicitações', icon: 'list', params: { function: 'update'}, action: () => {} },
    { page: 'ProfilePage', name: 'Perfil', icon: 'person', params: this.updateProfileParams, action: () => {} },
    { page: null, name: 'Ajuda', icon: 'logo-whatsapp', params: null, action: () => this.openHelpPage() },
  ]

  constructor(
    public iab: InAppBrowser,
    public platform: Platform,
    public navParams: NavParams,
    public userProvider: UserProvider) {
      this.initTabs()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage')
  }
  
  initTabs() {
    if(this.userProvider.user.profile == UserProvider.ROLES.PROVIDER) {
      this.tabsList = [
        { page: 'SolicitationListPage', name: 'Solicitações', icon: 'list', action: () => {} },
        { page: 'VisitListPage', name: 'Visitas', icon: 'alarm', params: null, action: () => {}  },
        { page: 'EstimateListPage', name: 'Orçamentos', icon: 'hammer', params: null, action: () => {}  },
        { page: 'ProfilePage', name: 'Perfil', icon: 'person', params: this.updateProfileParams, action: () => {}  },
      ]
      this.categoriesTabIndex = 0;
    }
  }

  openHelpPage() {
    const phone = '+5585996779697'
    if(this.platform.is('ios'))
      this.iab.create(`whatsapp://send?phone=${phone}`, "_system", { location: "yes" })
    else
      window.open(`whatsapp://send?phone=${phone}`, "_system", "location=yes")
  }
}
