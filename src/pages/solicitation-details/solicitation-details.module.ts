import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitationDetailsPage } from './solicitation-details';

import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [
    SolicitationDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitationDetailsPage),
    Ionic2RatingModule,
  ],
})
export class SolicitationDetailsPageModule {}
