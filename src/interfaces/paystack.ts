export interface InitiateTransactionResult {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
export interface IPaystackPayment {
  status: boolean;
  message: string;
  data?: Data;
}

interface Data {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message?: any;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string;
  log: Log;
  fees: number;
  fees_split?: any;
  authorization: Authorization;
  customer: Customer;
  plan?: any;
  split: Split;
  order_id?: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data?: any;
  source?: any;
  fees_breakdown?: any;
  transaction_date: string;
  plan_object: Split;
  subaccount: Split;
}

interface Split {}

interface Customer {
  id: number;
  first_name?: any;
  last_name?: any;
  email: string;
  customer_code: string;
  phone?: any;
  metadata?: any;
  risk_action: string;
  international_format_phone?: any;
}

interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name?: any;
}

interface Log {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  history: History[];
}

interface History {
  type: string;
  message: string;
  time: number;
}

export interface ChargeSuccessEvent {
  event: string;
  data: CSData;
}

export interface CSData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message?: any;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: number;
  log: Log;
  fees?: any;
  customer: CSCustomer;
  authorization: CSAuthorization;
  plan: Plan;
}

interface Plan {}

interface CSAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  account_name: string;
}

interface CSCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone?: any;
  metadata?: any;
  risk_action: string;
}

interface Log {
  time_spent: number;
  attempts: number;
  authentication: string;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  channel?: any;
  history: History[];
}

interface History {
  type: string;
  message: string;
  time: number;
}

export interface PaystackWebhookEvent {
  event: string;
  data: EventData;
}

interface EventData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Metadata;
  fees_breakdown?: any;
  log?: any;
  fees: number;
  fees_split?: any;
  authorization: EventAuthorization;
  customer: EventCustomer;
  plan: EventPlan;
  subaccount: EventSubaccount;
  split: EventSubaccount;
  order_id?: any;
  paidAt: string;
  requested_amount: number;
  pos_transaction_data?: any;
  source: EventSource;
}

interface EventSource {
  type: string;
  source: string;
  entry_point: string;
  identifier?: any;
}

interface EventSubaccount {}

interface EventPlan {
  id: number;
  name: string;
  plan_code: string;
  description?: any;
  amount: number;
  interval: string;
  send_invoices: number;
  send_sms: number;
  currency: string;
}

interface EventCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata?: any;
  risk_action: string;
  international_format_phone?: any;
}

interface EventAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name?: any;
  receiver_bank_account_number?: any;
  receiver_bank?: any;
}

interface Metadata {
  referrer: string;
}
