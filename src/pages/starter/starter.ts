import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { SigninPage } from '../signin/signin';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { TabsPage } from '../tabs/tabs';
import { ErrorChecker } from '../../util/error-checker';

@Component({
  selector: 'page-starter',
  templateUrl: 'starter.html',
})
export class StarterPage {
  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public authProvider: AuthenticationProvider,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StarterPage');
  }

  openSigninPage() {
    this.navCtrl.push(SigninPage)
  }

  openFacebookSigninPage() {
    const loading = this.loadingCtrl.create({ content: 'Entrando...' })

    loading.present()
      .then(() => this.authProvider.signinFacebook())
      .then(() => this.navCtrl.setRoot(TabsPage))
      .catch(error => ErrorChecker.getErrorMessage(error, this.toastCtrl))
      .then(() => loading.dismiss().catch(() => {}))
  }

  openSignupPage() {
    this.navCtrl.push('SignupPage')
  }

}
