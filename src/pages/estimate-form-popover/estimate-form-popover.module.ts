import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstimateFormPopoverPage } from './estimate-form-popover';

@NgModule({
  declarations: [
    EstimateFormPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(EstimateFormPopoverPage),
  ],
})
export class EstimateFormPopoverPageModule {}
