import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileAttribPage } from './profile-attrib';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    ProfileAttribPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(ProfileAttribPage),
  ],
})
export class ProfileAttribPageModule {}
