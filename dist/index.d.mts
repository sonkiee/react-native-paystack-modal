import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Configuration options for a Paystack payment
 */
interface Paystack$1 {
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
    /** A valid Paystack subaccount code (e.g., ACCT_8f4s1eq7ml6rlzj) */
    subaccountCode?: string;
    /** Account that bears the charges: 'account' or 'subaccount' */
    bearer?: "account" | "subaccount";
    /** A flat fee the main account should take */
    transactionCharge?: number;
    /** Split code for dynamically sharing a single transaction with multiple partners */
    splitCode?: string;
    /** Access code returned from server-side transaction initialization */
    accessCode?: string;
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
type PaystackFlow = "checkout" | "newTransaction" | "resumeTransaction" | "preloadTransaction" | "paymentRequest" | "cancelTransaction";
/**
 * Response returned by Paystack on successful transaction
 */
interface PaystackResponse {
    /** Reference used for this transaction */
    reference: string;
    /** Transaction status (success, failed, etc.) */
    status: string;
    /** Unique transaction identifier */
    transaction: string;
}

/**
 * Paystack SDK class
 * Provides type-safe methods to interact with InlineJS in WebView
 */
declare class Paystack {
    /**
     * One-off async checkout
     * Automatically uses 'checkout' flow
     */
    static checkout(config: Paystack$1): any;
    /**
     * Synchronous new transaction
     * Automatically uses 'newTransaction' flow
     */
    static newTransaction(config: Paystack$1): any;
    /**
     * Resume a server-initialized transaction using access code
     * @param accessCode - Access code returned by backend initialization
     * @param callbacks - Optional callbacks for success, cancel, error, load
     */
    static resumeTransaction(accessCode: string, callbacks?: Partial<Pick<Paystack$1, "onSuccess" | "onCancel" | "onError" | "onLoad">>): any;
    /**
     * Preload a transaction for instant modal display
     */
    static preloadTransaction(config: Paystack$1): any;
    /**
     * Cancel a transaction
     */
    static cancelTransaction(reference: string, onCancel?: () => void, onError?: (e: any) => void): void;
    /**
     * Payment request (for wallets like Apple Pay)
     */
    static paymentRequest(config: Paystack$1): any;
}

declare function PayStackModalHost(): react_jsx_runtime.JSX.Element | null;

export { Paystack, type PaystackFlow, PayStackModalHost as PaystackModalHost, type PaystackResponse };
