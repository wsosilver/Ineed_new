import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitationFormPage } from './solicitation-form';
import { ServicesProvider } from '../../providers/services/services';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { Camera } from '@ionic-native/camera';
import { PhotoViewer } from '@ionic-native/photo-viewer';

@NgModule({
  declarations: [
    SolicitationFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitationFormPage),
  ],
  providers: [
    Camera,
    PhotoViewer,
    ServicesProvider,
    AuthenticationProvider,
  ]
})
export class SolicitationFormPageModule {}
