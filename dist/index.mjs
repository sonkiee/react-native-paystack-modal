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
    return promise;
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
    return promise;
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
    return promise;
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
    return promise;
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
    return promise;
  }
};

// src/paystack-modal.tsx
import React, { useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { WebView } from "react-native-webview";

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

// src/paystack-modal.tsx
import { jsx } from "react/jsx-runtime";
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
  const closeAndClean = (action) => {
    action == null ? void 0 : action();
    setVisible(false);
    setConfig(null);
    setResolver(null);
  };
  if (!visible || !config) return null;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      visible,
      animationType: "slide",
      onRequestClose: () => {
        closeAndClean(() => resolver == null ? void 0 : resolver.reject("Payment cancelled"));
      },
      children: /* @__PURE__ */ jsx(SafeAreaView, { style: styles.container, children: /* @__PURE__ */ jsx(
        WebView,
        {
          originWhitelist: ["*"],
          source: { html: generateHTML(config) },
          onMessage: (event) => {
            var _a;
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "success") {
              closeAndClean(() => resolver == null ? void 0 : resolver.resolve(data.data));
            }
            if (data.type === "cancel") {
              closeAndClean(() => resolver == null ? void 0 : resolver.reject("Payment cancelled"));
            }
            if (data.type === "error") {
              closeAndClean(() => resolver == null ? void 0 : resolver.reject(data.data));
            }
            if (data.type === "load") {
              (_a = config.onLoad) == null ? void 0 : _a.call(config);
            }
          }
        }
      ) })
    }
  );
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 16
  },
  closeButton: {
    paddingVertical: 8
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000"
  }
});
export {
  Paystack,
  PayStackModalHost as PaystackModalHost
};
//# sourceMappingURL=index.mjs.map