/**
 * Configuration options for a Paystack payment
 */
export interface Paystack {
  /** Your public key, gotten from your Paystack dashboard in Settings > API Keys & Webhook  */
  key: string;

  /** The amount of the transaction in the lowest denomination of your currency */
  amount: number;

  /** The customer's email address */
  email: string;

  /** Transaction currency (defaults to NGN) */
  currency?: string;

  /** Customer first name */
  firstName?: string;

  /** Customer last name */
  lastName?: string;

  /** Customer phone number */
  phone?: string;

  /** Optional customer code for integration with Paystack customer system */
  customerCode?: string;

  /** Channels to accept payment from (card, bank, ussd, qr, etc.) */
  channel?: string[];

  /** Optional metadata to attach to transaction */
  metadata?: Record<string, any>;

  /** Reference for the transaction (auto-generated if not provided) */
  reference?: string;

  // --- Split Transaction Props ---
  /** A valid Paystack subaccount code (e.g., ACCT_8f4s1eq7ml6rlzj) */
  subaccountCode?: string;

  /** Account that bears the charges: 'account' or 'subaccount' */
  bearer?: "account" | "subaccount";

  /** A flat fee the main account should take */
  transactionCharge?: number;

  // --- Multi-Split Transaction Props ---
  /** Split code for dynamically sharing a single transaction with multiple partners */
  splitCode?: string;

  // --- Resume Transaction Props ---
  /** Access code returned from server-side transaction initialization */
  accessCode?: string;

  // --- Event Callbacks ---
  /** Called when the modal loads successfully */
  onLoad?: () => void;

  /** Called when the payment is successful */
  onSuccess?: (response: PaystackResponse) => void;

  /** Called when the payment is cancelled by user */
  onCancel?: () => void;

  /** Called if any error occurs during transaction */
  onError?: (error: any) => void;

  /** Used internally to indicate the flow type: checkout, newTransaction, resumeTransaction */
  flow?: PaystackFlow;
}

/** Available flows for the Paystack modal */
export type PaystackFlow =
  | "checkout"
  | "newTransaction"
  | "resumeTransaction"
  | "preloadTransaction"
  | "paymentRequest"
  | "cancelTransaction";

/**
 * Response returned by Paystack on successful transaction
 */
export interface PaystackResponse {
  /** Reference used for this transaction */
  reference: string;

  /** Transaction status (success, failed, etc.) */
  status: string;

  /** Unique transaction identifier */
  transaction: string;
}
