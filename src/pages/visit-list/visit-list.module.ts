import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitListPage } from './visit-list';
import { VisitProvider } from '../../providers/visit/visit';

@NgModule({
  declarations: [
    VisitListPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitListPage),
  ],
  providers: [
    VisitProvider
  ]
})
export class VisitListPageModule {}
