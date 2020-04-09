import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-use-terms',
  templateUrl: 'use-terms.html',
})
export class UseTermsPage {
  static CLASS_NAME = 'UseTermsPage'

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UseTermsPage');
  }

}
