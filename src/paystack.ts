import { launchModal } from "./modal-controller";
import { Paystack as PaystackInterface, PaystackResponse } from "./types";

/**
 * Paystack SDK class
 * Provides type-safe methods to interact with InlineJS in WebView
 */
export default class Paystack {
  /**
   * One-off async checkout
   * Automatically uses 'checkout' flow
   */
  static checkout(config: PaystackInterface) {
    const promise = launchModal({ ...config, flow: "checkout" });

    promise
      .then((response: PaystackResponse) => config.onSuccess?.(response))
      .catch((error: any) => {
        if (error === "Payment cancelled") config.onCancel?.();
        else config.onError?.(error);
      });

    return promise.catch(() => {}); // prevent unhandled promise rejection if caller doesn't handle it
  }

  /**
   * Synchronous new transaction
   * Automatically uses 'newTransaction' flow
   */
  static newTransaction(config: PaystackInterface) {
    const promise = launchModal({ ...config, flow: "newTransaction" });

    promise
      .then((response: PaystackResponse) => config.onSuccess?.(response))
      .catch((error: any) => {
        if (error === "Payment cancelled") config.onCancel?.();
        else config.onError?.(error);
      });

    // Return the promise for optional async/await usage
    return promise.catch(() => {}); // prevent unhandled promise rejection if caller doesn't handle it
  }

  /**
   * Resume a server-initialized transaction using access code
   * @param accessCode - Access code returned by backend initialization
   * @param callbacks - Optional callbacks for success, cancel, error, load
   */
  static resumeTransaction(
    accessCode: string,
    callbacks?: Partial<
      Pick<PaystackInterface, "onSuccess" | "onCancel" | "onError" | "onLoad">
    >,
  ) {
    const promise = launchModal({
      flow: "resumeTransaction",
      accessCode,
      ...callbacks,
    });

    promise
      .then((response: PaystackResponse) => callbacks?.onSuccess?.(response))
      .catch((error: any) => {
        if (error === "Payment cancelled") callbacks?.onCancel?.();
        else callbacks?.onError?.(error);
      });

    return promise.catch(() => {}); // prevent unhandled promise rejection if caller doesn't handle it
  }

  /**
   * Preload a transaction for instant modal display
   */
  static preloadTransaction(config: PaystackInterface) {
    const promise = launchModal({ ...config, flow: "preloadTransaction" });

    promise
      .then((response: PaystackResponse) => config.onSuccess?.(response))
      .catch((error: any) => {
        if (error === "Payment cancelled") config.onCancel?.();
        else config.onError?.(error);
      });

    return promise.catch(() => {});
  }

  /**
   * Cancel a transaction
   */
  static cancelTransaction(
    reference: string,
    onCancel?: () => void,
    onError?: (e: any) => void,
  ) {
    launchModal({ flow: "cancelTransaction", reference })
      .then(() => onCancel?.())
      .catch((error: any) => onError?.(error));
  }

  /**
   * Payment request (for wallets like Apple Pay)
   */
  static paymentRequest(config: PaystackInterface) {
    const promise = launchModal({ ...config, flow: "paymentRequest" });

    promise
      .then((response: PaystackResponse) => config.onSuccess?.(response))
      .catch((error: any) => {
        if (error === "Payment cancelled") config.onCancel?.();
        else config.onError?.(error);
      });
    return promise.catch(() => {}); // prevent unhandled promise rejection if caller doesn't handle it
  }
}
