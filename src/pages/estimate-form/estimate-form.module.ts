import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { PhotoViewer } from '@ionic-native/photo-viewer';

import { ServicesProvider } from '../../providers/services/services';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

import { EstimateFormPage } from './estimate-form';

import { BrMaskerModule } from 'brmasker-ionic-3';
import { CollaboratorProvider } from '../../providers/collaborator/collaborator';

@NgModule({
  declarations: [
    EstimateFormPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(EstimateFormPage),
  ],
  providers: [
    Camera,
    PhotoViewer,
    ServicesProvider,
    AuthenticationProvider,
  ]
})
export class EstimateFormPageModule {}
