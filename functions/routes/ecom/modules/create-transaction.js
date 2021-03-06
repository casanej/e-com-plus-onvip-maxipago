const addInstallments = require('../../../lib/payments/add-installments')
const path = require('path')
const fs = require('fs')
const { baseUri } = require('../../../__env')

exports.post = ({ appSdk, admin }, req, res) => {
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const { params, application } = req.body
  const amount = params.amount || {}

  const config = Object.assign({}, application.data, application.hidden_data)

  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response = {
    payment_gateways: []
  }

  const { discount } = config
  if (discount && discount.value > 0) {
    if (discount.apply_at !== 'freight') {
      // default discount option
      const { value } = discount
      response.discount_option = {
        label: config.discount_option_label,
        value
      }
      // specify the discount type and min amount is optional
      ;['type', 'min_amount'].forEach(prop => {
        if (discount[prop]) {
          response.discount_option[prop] = discount[prop]
        }
      })
    }

    if (amount.total) {
      // check amount value to apply discount
      if (amount.total < discount.min_amount) {
        discount.value = 0
      } else {
        delete discount.min_amount

        // fix local amount object
        const maxDiscount = amount[discount.apply_at || 'subtotal']
        let discountValue
        if (discount.type === 'percentage') {
          discountValue = maxDiscount * discount.value / 100
        } else {
          discountValue = discount.value
          if (discountValue > maxDiscount) {
            discountValue = maxDiscount
          }
        }
        if (discountValue > 0) {
          amount.discount = (amount.discount || 0) + discountValue
          amount.total -= discountValue
          if (amount.total < 0) {
            amount.total = 0
          }
        }
      }
    }
  }

  // setup payment gateway objects
  const intermediator = {
    name: 'Maxi Pago',
    link: 'https://www.maxipago.com/',
    code: 'maxiPago'
  }
  ;['credit_card'].forEach(paymentMethod => {
    const methodConfig = config[paymentMethod] || {}
    if (!methodConfig.disable) {
      const isCreditCard = paymentMethod === 'credit_card'
      const label = methodConfig.label || (isCreditCard ? 'Cart??o de cr??dito' : 'Boleto banc??rio')
      const gateway = {
        label,
        icon: methodConfig.icon,
        text: methodConfig.text,
        payment_method: {
          code: paymentMethod,
          name: `${label} - ${intermediator.name}`
        },
        intermediator
      }

      if (isCreditCard) {
        if (!gateway.icon) {
          gateway.icon = `${baseUri}/credit-card.png`
        }
        // https://github.com/pagarme/pagarme-js
        gateway.js_client = {
          script_uri: '',
          onload_expression: fs.readFileSync(path.join(__dirname, '../../../public/onload-expression.min.js'), 'utf8'),
          cc_hash: {
            function: '_maxiPagoHash',
            is_promise: true
          }
        }
        const { installments } = config
        if (installments) {
          // list all installment options and default one
          addInstallments(amount, installments, gateway, response)
        }
      }

      if (methodConfig.discount) {
        gateway.discount = methodConfig.discount
      } else if (
        discount &&
        (discount[paymentMethod] === true || (!isCreditCard && discount[paymentMethod] !== false))
      ) {
        gateway.discount = discount
        if (response.discount_option && !response.discount_option.label) {
          response.discount_option.label = label
        }
      }

      response.payment_gateways.push(gateway)
    }
  })

  res.send(response)
}
