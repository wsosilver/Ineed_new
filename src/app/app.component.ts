import { Component, ViewChild } from '@angular/core';

import { Platform, Events, Nav, AlertController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Storage } from '@ionic/storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { UserProvider } from '../providers/user/user';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { AboutProvider } from '../providers/about/about';

import { StarterPage } from '../pages/starter/starter';
import { TabsPage } from '../pages/tabs/tabs';
import { SolicitationDetailsPage } from '../pages/solicitation-details/solicitation-details';

import { ErrorChecker } from '../util/error-checker';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  
  rootPage:any = StarterPage;

  private isLogged = false;
  private isResumed = false;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    events: Events,
    private storage: Storage,
    private alertController: AlertController,
    private push: Push,
    private deeplinks: Deeplinks,
    private aboutProvider: AboutProvider,
    private authenticationProvider: AuthenticationProvider,
  ) {
    // Handle app restart after photo
    platform.resume.subscribe(data => {
      if(data.action == 'resume' && data.pendingResult && data.pendingResult.pluginServiceName == 'Camera') {
        this.isResumed = true
        this.handleTakePictureResume(data.pendingResult.result)
      }
    })

    events.subscribe('user:signin', () => this.isLogged = true)
    events.subscribe('user:signout', () => this.isLogged = false)

    events.subscribe('user:data-loaded', () => {
      if(this.isLogged)
        this.subscribeNotification()

      if(this.isLogged && !this.isResumed)
        this.rootPage = TabsPage

      if(!this.isLogged)
        this.nav.setRoot(StarterPage)
    })
      
    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    platform.ready().then(() => {
      this.deeplinks
        .routeWithNavController(this.nav, { '/discount/:code': 'CupomPage' })
        .subscribe(data => {}, error => console.log(error))
      
      statusBar.styleDefault();
      splashScreen.hide()

      this.checkForUpdates()
    });
  }

  private checkForUpdates() {
    this.aboutProvider.isUpdated()
      .then(isUpdated => {
        if(isUpdated === -1)
          this.alertController.create({
            title: 'Nova atualização disponível',
            subTitle: 'Existe uma versão mais recente do aplicativo. Deseja atualizar?',
            buttons: [
              { text: 'Sim', handler: () => this.aboutProvider.openStore() },
              { text: 'Não', role: 'cancel' }
            ]
          }).present()
      })
      .catch(error => console.log('Could not get latested version', error))
  }
  
  private subscribeNotification() {
    const options: PushOptions = {}
    const pushObject: PushObject = this.push.init(options)

    pushObject.on("registration").subscribe(
      data => console.log(data),
      error => console.log(error))

    pushObject.on("notification").subscribe(
      notification => this.handleNotification(notification),
      error => console.log(error))

  //   this.firebaseProvider.getToken()
  //   .then(fcmToken => this.authenticationProvider.updateFcmToken(fcmToken))
  //   .then(() => console.log('FCM Token Update'))
  //   .catch(error => console.log(error))

  //   this.firebaseProvider.onTokenRefresh().subscribe(
  //     fcmToken => this.authenticationProvider.updateFcmToken(fcmToken),
  //     error => ErrorChecker.getErrorMessage(error)
  //   )

  //   this.firebaseProvider.onNotification().subscribe(
  //     notification => this.handleNotification(notification),
  //     error => ErrorChecker.getErrorMessage(error)
  //   )
  }

  public handleNotification(notification) {
    let page = ''
    const title = notification.title
    const message = notification.body
    let data = {  }

    switch (notification.status) {
      case "solicitacao-criada":
        page = 'SolicitationFormPage'
        data = { solicitationId: notification.solicitacaoId }
        break;

      case "visita-criada":
        page = SolicitationDetailsPage.ClassName
        data = {
          selectedPage: SolicitationDetailsPage.Pages.Visit,
          solicitationId: notification.solicitacaoId,
        }
        break;

      case "visita-paga":
        page = 'VisitFormPage'
        data = {
          solicitationId: notification.solicitacaoId,
          visitId: notification.visitaId
        }
        break;

      case "visita-concluida":
        page = SolicitationDetailsPage.ClassName
        data = {
          selectedPage: SolicitationDetailsPage.Pages.Visit,
          solicitationId: notification.solicitacaoId,
        }
        break;

      case "orcamento-criado":
        page = SolicitationDetailsPage.ClassName
        data = {
          selectedPage: SolicitationDetailsPage.Pages.Estimate,
          solicitationId: notification.solicitacaoId
        }
        break;

      case "orcamento-pago":
        page = 'EstimateFormPage'
        data = {
          visitId: notification.visitaId,
          solicitationId: notification.solicitacaoId,
          estimateId: notification.estimateId,
          hasMaterial: notification.hasMaterial
        }
        break;

      case "orcamento-concluido":
        page = SolicitationDetailsPage.ClassName
        data = {
          selectedPage: SolicitationDetailsPage.Pages.Estimate,
          solicitationId: notification.solicitacaoId,
        }
        break;
  
      default:
        break;
    }
    
    if(!page)
      return

    if(notification.wasTapped)
      this.nav.push(page, data)
    else
      this.createAlert(title, message, page, data)
  }

  private createAlert(title, message, page, data = null) {
    this.alertController.create({
      title: title,
      message: message,
      buttons: [
          { text: 'Vamos lá!', handler: () => { this.nav.push(page, data) } },
          { text: 'Não', role: 'cancel' }
      ]
    }).present()
  }

  private handleTakePictureResume(result) {
    this.storage.get('solicitationData').then(data => {
      this.nav.setPages([
        { page: TabsPage },
        { page: 'SolicitationFormPage', params: { solicitationResumed: true, solicitationForm: data, image: result } }
      ])
    })
  }

}
