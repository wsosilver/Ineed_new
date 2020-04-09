import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitationListPage } from './solicitation-list';

@NgModule({
  declarations: [
    SolicitationListPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitationListPage),
  ],
})
export class SolicitationListPageModule {}
