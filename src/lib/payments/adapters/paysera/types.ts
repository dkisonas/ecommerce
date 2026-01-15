/**
 * Paysera-specific types
 */

export interface PayseraConfig {
  /** Paysera project ID */
  projectId: string
  /** Sign password for request signatures */
  signPassword: string
  /** Whether to use test mode */
  testMode?: boolean
}

/**
 * Paysera callback status codes
 * @see https://developers.paysera.com/lt/checkout/integrations/integration-callback
 */
export type PayseraStatus = '0' | '1' | '2' | '3' | '4' | '5'

export interface PayseraCallbackData {
  /** Project ID */
  projectid?: string
  /** Order ID from merchant system */
  orderid: string
  /**
   * Payment status:
   * - 0 = Payment failed
   * - 1 = Successfully completed (only trust this!)
   * - 2 = Instruction accepted, pending execution
   * - 3 = Additional payment information
   * - 4 = Completed without confirmation guarantee
   * - 5 = Payment refunded
   */
  status: PayseraStatus
  /** Paysera transaction reference number */
  requestid: string
  /** Original requested amount in cents */
  request_amount?: string
  /** Original requested currency */
  request_currency?: string
  /** Actual transferred amount in cents (may differ due to conversion) */
  pay_amount?: string
  /** Actual transferred currency */
  pay_currency?: string
  /** Legacy: Payment amount (use request_amount/pay_amount instead) */
  amount?: string
  /** Legacy: Currency (use request_currency/pay_currency instead) */
  currency?: string
  /** Payment method identifier */
  payment?: string
  /** Payer's country */
  country?: string
  /** Payment method's country */
  payment_country?: string
  /** IP-based country detection */
  payer_ip_country?: string
  /** Payer email address */
  p_email?: string
  /** Payer name from payment system */
  name?: string
  /** Payer surname from payment system */
  surename?: string
  /** Personal ID verification result (0-3) */
  personcodestatus?: string
  /** Payment purpose description */
  paytext?: string
  /** Test transaction indicator */
  test?: string
  /** API version */
  version?: string
  /** Source account number */
  account?: string
}

export interface PayseraRequestParams {
  projectid: string
  orderid: string
  accepturl: string
  cancelurl: string
  callbackurl: string
  version: string
  sign_password?: never // Never include in params
  amount: string
  currency: string
  test?: string
  p_email?: string
  p_firstname?: string
  p_lastname?: string
  lang?: string
}
