import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';

import moment from 'moment'

export class CustomValidators {

  public static matchPassword(abstractControl: AbstractControl) {
    const password = abstractControl.get('password').value
    const passwordConfirmation = abstractControl.get('passwordConfirmation').value

    if (password != passwordConfirmation)
      abstractControl.get('passwordConfirmation').setErrors({ matchPassword: true })
    else
      return null
  }

  public static matchEmail(abstractControl: AbstractControl) {
    const email = abstractControl.get('email').value
    const emailConfirmation = abstractControl.get('emailConfirmation').value

    if (email != emailConfirmation)
      abstractControl.get('emailConfirmation').setErrors({ matchEmail: true })
    else
      return null
  }

  public static beforeDate(date: string, format: string = 'YYYY-MM-DD'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: string } | null => {

      const checkedDate = moment(date, format)
      const myDate = moment(control.value, format)

      if (myDate.isBefore(checkedDate))
        return null
      else
        return { beforeDate: checkedDate.format('DD/MM/YYYY') }


    }
  }

  public static afterToday(date, format: string = 'YYYY-MM-DD'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: string } | null => {
      const checkedDate = moment(date.value, format)
      const now = moment()

      if (checkedDate.isAfter(now))
        return null
      else
        return { afterToday: now.format('DD/MM/YYYY') }
    }
  }

  public static beforeToday(control: FormControl) {
    const checkedDate = moment(control.value, 'YYYY-MM-DD')
    const now = moment()
    if (checkedDate.isBefore(now, "day"))
      return { afterToday: now.format('DD/MM/YYYY') }
    else
      return null
  }

  public static beforeTime(abstractControl: AbstractControl) {
    const date = abstractControl.get('startDate').value
    const time = abstractControl.get('startTime').value
    const solicitationDate = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm')
    const today = moment()

    if(solicitationDate.isValid() && today.isAfter(today, 'hour'))
      abstractControl.get('startTime').setErrors({ beforeTime: true })
    else
      return null
  }

  public static afterOrEqualToday(date, format: string = 'YYYY-MM-DD'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: string } | null => {
      const checkedDate = moment(date.value, format)
      const now = moment()

      if (checkedDate.format(format).toString() == now.format(format).toString() || checkedDate.isAfter(now))
        return null
      else
        return { afterOrEqualToday: now.format('DD/MM/YYYY') }
    }
  }

  public static beforeHour(time, format: string = 'HH:mm'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: string } | null => {
      const checkedDate = moment(time.value, format)
      const now = moment()

      if (checkedDate.isSameOrBefore(now))
        return null
      else
        return { beforeHour: now.format('HH:mm') }
    }
  }

  public static minTimeDiff(abstractControl: AbstractControl) {
    const date = abstractControl.get('startDate').value
    const time = abstractControl.get('startTime').value
    const solicitationDate = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm')

    const timeInMinutes = 120
    const today = moment().add(timeInMinutes, 'minutes')

    if(solicitationDate.isValid() && solicitationDate.isSameOrAfter(today, 'minutes'))
      return null
    else
      abstractControl.get('startTime').setErrors({ timeDiff: timeInMinutes })
  }

}