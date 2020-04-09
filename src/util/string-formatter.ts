export class StringFormatter {
  static insertAddressNumber(address: string, number: string | number = '', complement: string = '') {
    complement = (complement) ? `, ${complement.trim()}` : ''
    number = (number) ? `, ${number}` : ''

    const splitedAddress = (address) ? address.split(',') : [ '', '' ]
    const street = (splitedAddress[0]) ? `${splitedAddress[0].trim()}` : ''
    const neighborhood = (splitedAddress[1]) ? `, ${splitedAddress[1].trim()}` : ''

    const newAddress = `${street}${number}${complement}${neighborhood}`

    return newAddress
  }

}