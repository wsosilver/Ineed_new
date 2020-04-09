import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Platform } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';

import { environment } from '../../environment/environment';

import { HttpFactory } from '../../util/http-factory';

import { Observable } from 'rxjs';
import * as compareVersions from 'compare-versions';

@Injectable()
export class AboutProvider {
  private apiUrl = environment.apiUrl

  constructor(
    public http: HttpClient,
    private market: Market,
    private platform: Platform,
    private appVersion: AppVersion) {
    console.log('Hello CollaboratorProvider Provider');
  }

  get() {
    const route = `${this.apiUrl}/sobre`
    const params = HttpFactory.getRequestOptions({})
    const request: Observable<HttpEvent<any>> = this.http.get<any>(route, params)
  
    const response = new Promise((resolve, reject) => {
      request.subscribe(
        data => resolve(data),
        error => reject(error))
    })
  
    return response
  }

  isUpdated() {
    let latestVersion = '0'

    return this.get()
      .then((data: any) => {
        latestVersion = data.appVersion
        return this.appVersion.getVersionNumber()
      })
      .then((appVersion: any) => compareVersions(appVersion, latestVersion))
  }

  openStore() {
    this.appVersion.getPackageName()
      .then(packageName => {
        if(this.platform.is('ios'))
          this.market.open('fixit/id1373851231')
        else if (this.platform.is('android'))
          this.market.open(packageName)
      })
  }
}
