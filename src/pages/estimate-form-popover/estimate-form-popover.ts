import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-estimate-form-popover',
  template: `
    <ion-list class="popover-menu">
      <button ion-item (click)="close()">
        Editar
      </button>
    </ion-list>`,
})
export class EstimateFormPopoverPage {
  public static ACTION = {
    CHANGE_TO_EDIT: 0
  }

  constructor(public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EstimateFormPopoverPage');
  }

  close() {
    this.viewCtrl.dismiss({ action: EstimateFormPopoverPage.ACTION.CHANGE_TO_EDIT})
  }

}
