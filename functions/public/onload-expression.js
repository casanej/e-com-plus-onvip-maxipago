(function () {
    window.maxipagoAxios = function (card, valorTransacao, processorId, mpKey, mpLojaId) {
      return new Promise(((resolve, reject) => {
        window.axios({
          method: 'post',
          url: 'https://api.maxipago.net/UniversalAPI/postXML',
          headers: {
            Authorization: 'text/xml',
          },
          data: `<transaction-request><version>3.1.1.15</version><verification><merchantId>${mpLojaId}</merchantId><merchantKey>${mpKey}</merchantKey></verification><order><sale><processorID>${processorId}</processorID><ipAddress>192.168.0.10</ipAddress><referenceNum>00001</referenceNum><transactionDetail><payType><creditCard><number>${card.card_number}</number><expMonth>${card.exp_month}</expMonth><expYear>${card.exp_year}</expYear><cvvNumber>${card.cvv}</cvvNumber></creditCard></payType></transactionDetail><payment><currencyCode>BRL</currencyCode><chargeTotal>${valorTransacao}</chargeTotal></payment></sale></order></transaction-request>`,
          responseType: 'xml'
        })
          .then((response) => resolve(response.data.payment_profile.gateway_token))
          .catch(reject)
      }))
    }
  }())
  