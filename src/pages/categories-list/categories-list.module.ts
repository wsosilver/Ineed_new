import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoriesListPage } from './categories-list';

import { ServicesProvider } from '../../providers/services/services';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    CategoriesListPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(CategoriesListPage),
  ],
  providers: [
    ServicesProvider
  ]
})
export class CategoriesListPageModule {}
