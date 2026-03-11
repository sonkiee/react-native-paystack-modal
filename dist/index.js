"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Paystack: () => Paystack,
  PaystackModalHost: () => PayStackModalHost
});
module.exports = __toCommonJS(index_exports);

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
var import_react = __toESM(require("react"));
var import_react_native = require("react-native");

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
var import_jsx_runtime = require("react/jsx-runtime");
var WebView;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {
  throw new Error(
    "react-native-webview is required for PaystackModalHost. Please install it using 'npm install react-native-webview' or 'yarn add react-native-webview'"
  );
}
function PayStackModalHost() {
  const [visible, setVisible] = import_react.default.useState(false);
  const [config, setConfig] = import_react.default.useState(null);
  const [resolver, setResolver] = import_react.default.useState(null);
  (0, import_react.useEffect)(() => {
    registerModal((cfg) => {
      return new Promise((resolve, reject) => {
        setConfig(cfg);
        setResolver({ resolve, reject });
        setVisible(true);
      });
    });
  }, []);
  if (!config) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_native.Modal, { visible, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Paystack,
  PaystackModalHost
});
//# sourceMappingURL=index.js.map