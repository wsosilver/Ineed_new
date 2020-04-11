export class HttpFactory {
  static getRequestOptions(params?) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }


    for (var property in params) {
      headers[property] = params[property]
    }

    const options = { headers: headers }

    return options
  }
}