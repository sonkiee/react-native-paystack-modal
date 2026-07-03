import { Paystack } from "./types";

/**
 * Generates HTML for WebView to run Paystack Inline JS
 * Handles all Paystack flows: checkout, newTransaction, resumeTransaction, preloadTransaction, cancelTransaction, paymentRequest
 */
export function generateHTML(config: Paystack) {
  const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Paystack Payment</title>
    <script src="https://js.paystack.co/v2/inline.js"></script>
  </head>
  <body>
    <script>
      (function() {
        const cfg = ${JSON.stringify(config)};

        if (!cfg) return;

        // Bridge callbacks to React Native
        const callbacks = {
          onSuccess: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "success",
              data: response
            }));
          },
          onCancel: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "cancel" }));
          },
          onLoad: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "load" }));
          },
          onError: function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "error",
              data: error
            }));
          }
        };

        // Set defaults
        cfg.currency = cfg.currency || "NGN";
        cfg.reference = cfg.reference || Math.floor(Math.random() * 1000000000 + 1).toString();

        const popup = new PaystackPop();
        let handler;

        switch (cfg.flow) {
          case "resumeTransaction":
            if (!cfg.accessCode) {
              callbacks.onError("accessCode is required for resumeTransaction");
              return;
            }
            handler = popup.resumeTransaction(cfg.accessCode, callbacks);
            break;

          case "newTransaction":
            handler = popup.newTransaction(Object.assign({}, cfg, callbacks));
            break;

          case "preloadTransaction":
            handler = popup.preloadTransaction(Object.assign({}, cfg, callbacks));
            break;

          case "cancelTransaction":
            handler = popup.cancelTransaction(cfg.reference);
            break;

          case "paymentRequest":
            handler = popup.paymentRequest(Object.assign({}, cfg, callbacks));
            break;

          case "checkout":
          default:
            handler = popup.newTransaction(Object.assign({}, cfg, callbacks));
        }

        // Open the modal if available
        if (handler?.openIframe) handler.openIframe();
      })();
    </script>
  </body>
</html>
`;
  return template;
}
