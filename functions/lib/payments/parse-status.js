module.exports = maxiPagoStatus => {
  switch (maxiPagoStatus) {
    case 'processing':
    case 'analyzing':
      return 'under_analysis'
    case 'authorized':
    case 'paid':
    case 'refunded':
      return maxiPagoStatus
    case 'waiting_payment':
      return 'pending'
    case 'pending_refund':
      return 'in_dispute'
    case 'refused':
      return 'unauthorized'
    case 'chargedback':
      return 'refunded'
    case 'pending_review':
      return 'authorized'
  }
  return 'unknown'
}
