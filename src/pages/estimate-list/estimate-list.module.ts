import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstimateListPage } from './estimate-list';

@NgModule({
  declarations: [
    EstimateListPage,
  ],
  imports: [
    IonicPageModule.forChild(EstimateListPage),
  ],
})
export class EstimateListPageModule {}
