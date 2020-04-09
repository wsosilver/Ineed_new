import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ForgotPasswordPage } from './forgot-password';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

@NgModule({
  declarations: [
    ForgotPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ForgotPasswordPage),
  ],
  providers: [
    AuthenticationProvider
  ]
})
export class ForgotPasswordPageModule {}
