import { ToastController, AlertController } from "ionic-angular";

export class FeedbackUser {
  public static showMessage(toastCtlr: ToastController, message, duration = 3000) {
    toastCtlr.create({
      message: message,
      duration: duration,
      position: 'top',
    }).present()
  }

  public static showAlert(alertCtrl: AlertController, title, message, handler = () => {}) {
    alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Ok', handler: handler }
      ]
    }).present()
  }
}