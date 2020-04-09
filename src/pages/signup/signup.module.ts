import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { UserProvider } from '../../providers/user/user';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(SignupPage),
  ],
  providers: [
    UserProvider,
  ]
})
export class SignupPageModule {}