import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class UserProvider {
  public static ROLES = {
    USER: 1,
    PROVIDER: 2,
    ADMIN: 3,
    COLLABORATOR: 4,
  }

  public user = {
    token: null,
    profile: null,
    id: null
  }

  constructor(private storage: Storage, private events: Events) {
    console.log('Hello UserInfoProvider Provider');
    this.getUserData()
  }

  private getUserData() {
    const promises: Array<Promise<any>> = []

    Object.keys(this.user).forEach(key => {
      const promise = this.storage.get(key).then(data => this.setUserAttribute(key, data))
      promises.push(promise)
    })

    Promise.all(promises)
      .then(() => this.events.publish('user:signin'))
      .catch(error => console.log('User not signedin:', error))
      .then(() => this.events.publish('user:data-loaded'))
  }

  private setUserAttribute(key, data) {
    if(data) {
      this.user[key] = data
      return Promise.resolve()
    } else {
      return Promise.reject('Attribute not found')
    }
  }

  public saveUserData(user: { token, profile, id }) {
    const promises: Array<Promise<any>> = []
    
    Object.keys(user).forEach(key => {
      const promise = this.storage.set(key, user[key])
      .then(() => {
        this.user[key] = user[key]
        return Promise.resolve()
      })

      promises.push(promise)
    })

    return Promise.all(promises)
  }

  public eraseUserData() {
    Object.keys(this.user).forEach(key => this.user[key] = null)
    return this.storage.clear().then(() => {
      this.events.publish('user:signout')
      this.events.publish('user:data-loaded')
      return Promise.resolve()
    })
  }

}
