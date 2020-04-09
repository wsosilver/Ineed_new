import { ToastController } from "ionic-angular";
import { Translator } from './translator';

export class ErrorChecker {
  public static getErrorMessage(response, toastCtlr: ToastController = null) {
    console.log(response)

    let error_message = ''

    if (response.error && response.error.hasOwnProperty('error'))
      error_message = response.error.error[0]

    else if (response.status && response.hasOwnProperty('status'))
      error_message = this.getStatusCodeErrorMessage(response.status)

    else if (response.message && response.hasOwnProperty('message') && response.message == 'Http failure response for (unknown url): 0 Unknown Error')
      error_message = 'Sua conexão a internet parece estar indisponível. O app pode não funcionar corretamente.'

    else if (response.message && response.hasOwnProperty('message'))
      error_message = response.message

    else
      error_message = 'Ocorreu um erro inesperado'

    if (toastCtlr) {
      toastCtlr.create({
        message: error_message,
        position: 'top',
        duration: 3000
      }).present()
    }

    return error_message
  }

  private static getStatusCodeErrorMessage(error) {
    let errorMessage = ''

    errorMessage = (error.status == 401) ? 'Usuário não possui permissão para acessar o recurso' : errorMessage;
    errorMessage = (error.status == 404) ? 'Não foi possível encontrar o servidor' : errorMessage;
    errorMessage = (error.status == 422) ? 'Não foi possível prosseguir com a requisição' : errorMessage;
    errorMessage = (error.status == 500) ? 'Ocorreu um erro inesperado' : errorMessage;

    errorMessage = (errorMessage == '') ? 'Não foi possível se conectar' : errorMessage;

    return errorMessage
  }

  public static getFormError(controls, toastCtlr: ToastController) {
    let errors = []

    Object.keys(controls).forEach(key => {
      if (controls[key].errors)
        console.log(key, controls[key].errors)

      if (controls[key].errors && controls[key].errors.required)
        errors.push(`O campo ${Translator.translate(key)} é obrigatório`)

      if (controls[key].errors && controls[key].errors.min)
        errors.push(`O campo ${Translator.translate(key)} deve ser maior ou igual a ${controls[key].errors.min.min}`)

      if (controls[key].errors && controls[key].errors.max)
        errors.push(`O campo ${Translator.translate(key)} deve ser menor ou igual a ${controls[key].errors.max.max}`)

      if (controls[key].errors && controls[key].errors.minlength) {
        const requiredLength = controls[key].errors.minlength.requiredLength
        errors.push(`O campo ${Translator.translate(key)} deve possuir no mínimo ${requiredLength} caracteres`)
      }

      if (controls[key].errors && controls[key].errors.maxlength) {
        const requiredLength = controls[key].errors.maxlength.requiredLength
        errors.push(`O campo ${Translator.translate(key)} deve possuir no máximo ${requiredLength} caracteres`)
      }

      if (controls[key].errors && controls[key].errors.email) {
        errors.push(`O campo ${Translator.translate(key)} deve estar no formato nome@email.com`)
      }

      if (controls[key].errors && controls[key].errors.beforeDate) {
        const date = controls[key].errors.beforeDate
        errors.push(`O campo ${Translator.translate(key)} deve ser inferior a ${date}`)
      }

      if (controls[key].errors && controls[key].errors.timeDiff) {
        const minTimeDiff = (controls[key].errors.timeDiff / 60).toFixed(0)
        errors.push(`A solicitação deve ser realizada com uma diferença de pelo menos ${minTimeDiff} duas horas`)
      }

      if (controls[key].errors && controls[key].errors.afterToday) {
        const date = controls[key].errors.afterToday
        errors.push(`O campo ${Translator.translate(key)} deve ser igual ou superior a ${date}`)
      }

      if (controls[key].errors && controls[key].errors.afterOrEqualToday) {
        const date = controls[key].errors.afterOrEqualToday
        errors.push(`O campo ${Translator.translate(key)} deve ser superior a ${date}`)
      }

      if (controls[key].errors && controls[key].errors.matchPassword) {
        errors.push(`O campos senha e confirmar senha devem ser iguais`)
      }

      if (controls[key].errors && controls[key].errors.matchEmail) {
        errors.push(`O campos email e confirmar email devem ser iguais`)
      }

      if(controls[key].errors && controls[key].errors.beforeTime) {
        errors.push(`O horário da solicitação não pode ser inferior ao horário atual.`)
      }
    })

    if (errors.length > 0)
      toastCtlr.create({
        message: errors[0],
        position: 'top',
        duration: 5000
      }).present()

    return errors

  }
}