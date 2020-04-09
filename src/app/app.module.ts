import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { SigninPage } from '../pages/signin/signin';
import { StarterPage } from '../pages/starter/starter';
import { ChangePasswordPage } from '../pages/change-password/change-password';
import { TabsPage } from '../pages/tabs/tabs';

import { BrMaskerModule } from 'brmasker-ionic-3';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
// import { FCM } from '@ionic-native/fcm';
import { Facebook } from '@ionic-native/facebook';
import { IonicStorageModule } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Deeplinks } from '@ionic-native/deeplinks';
import { FilePath } from '@ionic-native/file-path';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Push } from '@ionic-native/push';

import { AuthenticationProvider } from '../providers/authentication/authentication';
import { UserProvider } from '../providers/user/user';
import { AddressProvider } from '../providers/address/address';
import { SolicitationProvider } from '../providers/solicitation/solicitation';
import { VisitProvider } from '../providers/visit/visit';
import { EstimateProvider } from '../providers/estimate/estimate';
import { CreditCardProvider } from '../providers/credit-card/credit-card';
import { ServicesProvider } from '../providers/services/services';
import { ConfigurationProvider } from '../providers/configuration/configuration';

import { HttpRequestInterceptor } from '../modules/http-request-interceptor';
import { CupomProvider } from '../providers/cupom/cupom';
import { CollaboratorProvider } from '../providers/collaborator/collaborator';
import { SolicitationListFilterPage } from '../pages/solicitation-list-filter/solicitation-list-filter';
import { AboutProvider } from '../providers/about/about';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    SigninPage,
    StarterPage,
    ChangePasswordPage,
    SolicitationListFilterPage,
  ],
  imports: [
    BrowserModule,
    BrMaskerModule,
    HttpClientModule,
    HttpRequestInterceptor,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      driverOrder: ['websql', 'sqlite', 'indexeddb']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    SigninPage,
    StarterPage,
    ChangePasswordPage,
    SolicitationListFilterPage,
  ],
  providers: [
    AppVersion,
    Market,
    // FCM,
    Push,
    File,
    FilePath,
    Facebook,
    FileTransfer,
    Deeplinks,
    SocialSharing,
    InAppBrowser,
    StatusBar,
    SplashScreen,
    UniqueDeviceID,
    AndroidPermissions,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthenticationProvider,
    UserProvider,
    AddressProvider,
    SolicitationProvider,
    VisitProvider,
    EstimateProvider,
    CreditCardProvider,
    ServicesProvider,
    ConfigurationProvider,
    CupomProvider,
    CollaboratorProvider,
    AboutProvider,
  ]
})
export class AppModule {}
