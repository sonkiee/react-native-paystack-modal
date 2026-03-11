var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/modal-controller.ts
var openModal;
function registerModal(fn) {
  openModal = fn;
}
function launchModal(config) {
  if (!openModal) {
    throw new Error("Paystack modal not mounted");
  }
  return openModal(config);
}

// src/paystack.ts
var Paystack = class {
  /**
   * One-off async checkout
   * Automatically uses 'checkout' flow
   */
  static checkout(config) {
    const promise = launchModal({ ...config, flow: "checkout" });
    promise.then((response) => {
      var _a;
      return (_a = config.onSuccess) == null ? void 0 : _a.call(config, response);
    }).catch((error) => {
      var _a, _b;
      if (error === "Payment cancelled") (_a = config.onCancel) == null ? void 0 : _a.call(config);
      else (_b = config.onError) == null ? void 0 : _b.call(config, error);
    });
    return promise.catch(() => {
    });
  }
  /**
   * Synchronous new transaction
   * Automatically uses 'newTransaction' flow
   */
  static newTransaction(config) {
    const promise = launchModal({ ...config, flow: "newTransaction" });
    promise.then((response) => {
      var _a;
      return (_a = config.onSuccess) == null ? void 0 : _a.call(config, response);
    }).catch((error) => {
      var _a, _b;
      if (error === "Payment cancelled") (_a = config.onCancel) == null ? void 0 : _a.call(config);
      else (_b = config.onError) == null ? void 0 : _b.call(config, error);
    });
    return promise.catch(() => {
    });
  }
  /**
   * Resume a server-initialized transaction using access code
   * @param accessCode - Access code returned by backend initialization
   * @param callbacks - Optional callbacks for success, cancel, error, load
   */
  static resumeTransaction(accessCode, callbacks) {
    const promise = launchModal({
      flow: "resumeTransaction",
      accessCode,
      ...callbacks
    });
    promise.then((response) => {
      var _a;
      return (_a = callbacks == null ? void 0 : callbacks.onSuccess) == null ? void 0 : _a.call(callbacks, response);
    }).catch((error) => {
      var _a, _b;
      if (error === "Payment cancelled") (_a = callbacks == null ? void 0 : callbacks.onCancel) == null ? void 0 : _a.call(callbacks);
      else (_b = callbacks == null ? void 0 : callbacks.onError) == null ? void 0 : _b.call(callbacks, error);
    });
    return promise.catch(() => {
    });
  }
  /**
   * Preload a transaction for instant modal display
   */
  static preloadTransaction(config) {
    const promise = launchModal({ ...config, flow: "preloadTransaction" });
    promise.then((response) => {
      var _a;
      return (_a = config.onSuccess) == null ? void 0 : _a.call(config, response);
    }).catch((error) => {
      var _a, _b;
      if (error === "Payment cancelled") (_a = config.onCancel) == null ? void 0 : _a.call(config);
      else (_b = config.onError) == null ? void 0 : _b.call(config, error);
    });
    return promise.catch(() => {
    });
  }
  /**
   * Cancel a transaction
   */
  static cancelTransaction(reference, onCancel, onError) {
    launchModal({ flow: "cancelTransaction", reference }).then(() => onCancel == null ? void 0 : onCancel()).catch((error) => onError == null ? void 0 : onError(error));
  }
  /**
   * Payment request (for wallets like Apple Pay)
   */
  static paymentRequest(config) {
    const promise = launchModal({ ...config, flow: "paymentRequest" });
    promise.then((response) => {
      var _a;
      return (_a = config.onSuccess) == null ? void 0 : _a.call(config, response);
    }).catch((error) => {
      var _a, _b;
      if (error === "Payment cancelled") (_a = config.onCancel) == null ? void 0 : _a.call(config);
      else (_b = config.onError) == null ? void 0 : _b.call(config, error);
    });
    return promise.catch(() => {
    });
  }
};

// src/paystack-modal.tsx
import React, { useEffect } from "react";
import { Modal } from "react-native";

// src/html-template.ts
function generateHTML(config) {
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

        let handler;

        switch (cfg.flow) {
          case "resumeTransaction":
            if (!cfg.accessCode) {
              callbacks.onError("accessCode is required for resumeTransaction");
              return;
            }
            handler = PaystackPop.resumeTransaction(cfg.accessCode, callbacks);
            break;

          case "newTransaction":
            handler = PaystackPop.setup(Object.assign({}, cfg, callbacks));
            break;

          case "preloadTransaction":
            handler = PaystackPop.preloadTransaction(Object.assign({}, cfg, callbacks));
            break;

          case "cancelTransaction":
            handler = PaystackPop.cancelTransaction(cfg.reference);
            break;

          case "paymentRequest":
            handler = PaystackPop.paymentRequest(Object.assign({}, cfg, callbacks));
            break;

          case "checkout":
          default:
            handler = PaystackPop.setup(Object.assign({}, cfg, callbacks));
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

// src/paystack-modal.tsx
import { jsx } from "react/jsx-runtime";
var WebView;
try {
  WebView = __require("react-native-webview").WebView;
} catch (e) {
  throw new Error(
    "react-native-webview is required for PaystackModalHost. Please install it using 'npm install react-native-webview' or 'yarn add react-native-webview'"
  );
}
function PayStackModalHost() {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState(null);
  const [resolver, setResolver] = React.useState(null);
  useEffect(() => {
    registerModal((cfg) => {
      return new Promise((resolve, reject) => {
        setConfig(cfg);
        setResolver({ resolve, reject });
        setVisible(true);
      });
    });
  }, []);
  if (!config) return null;
  return /* @__PURE__ */ jsx(Modal, { visible, children: /* @__PURE__ */ jsx(
    WebView,
    {
      originWhitelist: ["*"],
      source: { html: generateHTML(config) },
      onMessage: (event) => {
        var _a;
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "success") {
          resolver == null ? void 0 : resolver.resolve(data.data);
          setVisible(false);
          setConfig(null);
        }
        if (data.type === "cancel") {
          resolver == null ? void 0 : resolver.reject("Payment cancelled");
          setVisible(false);
          setConfig(null);
        }
        if (data.type === "error") {
          resolver == null ? void 0 : resolver.reject(data.data);
        }
        if (data.type === "load") {
          (_a = config.onLoad) == null ? void 0 : _a.call(config);
        }
      }
    }
  ) });
}
export {
  Paystack,
  PayStackModalHost as PaystackModalHost
};
//# sourceMappingURL=index.mjs.map