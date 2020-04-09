export class CreditCardIdentifier {

  private static brands = [{
    name: 'Elo',
    regexpBin: '^401178|^401179|^431274|^438935|^451416|^457393|^457631|^457632|^504175|^627780|^636297|^636368|^(506699|5067[0-6]\\d|50677[0-8])|^(50900\\d|5090[1-9]\\d|509[1-9]\\d{2})|^65003[1-3]|^(65003[5-9]|65004\\d|65005[0-1])|^(65040[5-9]|6504[1-3]\\d)|^(65048[5-9]|65049\\d|6505[0-2]\\d|65053[0-8])|^(65054[1-9]|6505[5-8]\\d|65059[0-8])|^(65070\\d|65071[0-8])|^65072[0-7]|^(65090[1-9]|65091\\d|650920)|^(65165[2-9]|6516[6-7]\\d)|^(65500\\d|65501\\d)|^(65502[1-9]|6550[3-4]\\d|65505[0-8])',
    regexpFull: '^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\\d|50677[0-8])|(50900\\d|5090[1-9]\\d|509[1-9]\\d{2})|65003[1-3]|(65003[5-9]|65004\\d|65005[0-1])|(65040[5-9]|6504[1-3]\\d)|(65048[5-9]|65049\\d|6505[0-2]\\d|65053[0-8])|(65054[1-9]|6505[5-8]\\d|65059[0-8])|(65070\\d|65071[0-8])|65072[0-7]|(65090[1-9]|65091\\d|650920)|(65165[2-9]|6516[6-7]\\d)|(65500\\d|65501\\d)|(65502[1-9]|6550[3-4]\\d|65505[0-8]))[0-9]{10,12}',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Diners',
    regexpBin: '^3(?:0[0-5]|[68][0-9])',
    regexpFull: '^3(?:0[0-5]|[68][0-9])[0-9]{11}$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Discover',
    regexpBin: '^6(?:011|5[0-9]{2})',
    regexpFull: '^6(?:011|5[0-9]{2})[0-9]{12}$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Hipercard',
    regexpBin: '^3841[046]0|^60',
    regexpFull: '^(38[0-9]{17}|60[0-9]{14})$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Amex',
    regexpBin: '^3[47]',
    regexpFull: '^3[47][0-9]{13}$',
    regexpCvv: '^\d{3,4}$',
  }, {
    name: 'Aura',
    regexpBin: '^50[0-9]',
    regexpFull: '^50[0-9]{14,17}$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'JCB',
    regexpBin: '^35[0-9]',
    regexpFull: '^50[0-9]{14,17}$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Master',
    regexpBin: '^5[1-5][0-9][0-9]',
    regexpFull: '^5[1-5][0-9]{14}$',
    regexpCvv: '^\d{3}$',
  }, {
    name: 'Visa',
    regexpBin: '^4',
    regexpFull: '^4[0-9]{12}(?:[0-9]{3})?$',
    regexpCvv: '^\d{3}$',
  }];

  private static cardNumberFilter(cardNumber, brand) {
    if (typeof cardNumber !== 'string') {
      throw Error('Card number should be a string');
    }

    return cardNumber.match(brand.regexpFull) !== null;
  }

  private static cardNameFilter(brandName, brand) {
    return brandName === brand.name;
  }

  private static hipercardRegexp() {
    let card = this.brands.filter(this.cardNameFilter.bind(this, 'hipercard'))[0];
    if (card) {
      return new RegExp(card.regexpFull);
    } else {
      return new RegExp('^$');
    }
  }

  public static findBrand(cardNumber) {
    if (!cardNumber || cardNumber === '') {
      cardNumber = '000000';
    }

    let brand: any = this.brands.filter(this.cardNumberFilter.bind(this, cardNumber))[0];

    if (brand === undefined) {
      throw Error('card number not supported');
    }

    brand = (brand === undefined) ? undefined : brand.name;

    return brand;
  }

  public static isSupported(cardNumber) {
    let number = cardNumber || '0000000000000001';

    let supported = false;
    let result = this.brands.filter(this.cardNumberFilter.bind(this, number))[0];
    if (result !== undefined) {
      supported = true;
    }

    return supported;
  }


}