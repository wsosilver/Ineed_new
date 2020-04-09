import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitFormPage } from './visit-form';
import { VisitProvider } from '../../providers/visit/visit';
import { SolicitationProvider } from '../../providers/solicitation/solicitation';

@NgModule({
  declarations: [
    VisitFormPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitFormPage),
  ],
  providers: [
    VisitProvider,
    SolicitationProvider,
  ],
})
export class VisitFormPageModule {}
