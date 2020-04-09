export class Translator {
  public static translate(text: string) {
    let translated = text

    const words = {
      password: 'senha',
      actualPassword: 'senha atual',
      newPassword: 'nova senha',
      newPasswordConfirmation: 'confirmação da nova senha',
      useTerms: 'termos de uso',
      serviceType: 'tipo de serviço',
      service: 'serviço',
      address: 'endereço',
      startDate: 'data de inicio',
      provideMaterial: 'fornecer material',
      observation: 'observações',
      visitDate: 'data da visita',
      price: 'preço',
      finished: 'concluido',
      paid: 'confirmado',
      deliveryDate: 'data de entrega',
      labor: 'serviço',
      startTime: 'horário inicial',
      finishTime: 'horário final',
      location: 'Imóvel',
      expirationMonth: 'mês de vencimento',
      expirationYear: 'ano de vencimento',
      creditCard: 'cartão de crédito',
      installments: 'parcelas',
    }

    if (words[text])
      translated = words[text]

    return translated
  }
}