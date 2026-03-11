import React, { useEffect } from "react";
import { registerModal } from "./modal-controller";
import { Modal } from "react-native";
import { generateHTML } from "./html-template";
import { Paystack } from "./types";

let WebView: typeof import("react-native-webview").WebView;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {
  throw new Error(
    "react-native-webview is required for PaystackModalHost. Please install it using 'npm install react-native-webview' or 'yarn add react-native-webview'",
  );
}

export default function PayStackModalHost() {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<Paystack | null>(null);
  const [resolver, setResolver] = React.useState<{
    resolve: (response: any) => void;
    reject: (error?: any) => void;
  } | null>(null);

  useEffect(() => {
    registerModal((cfg: Paystack) => {
      return new Promise((resolve, reject) => {
        setConfig(cfg);
        setResolver({ resolve, reject });
        setVisible(true);
      });
    });
  }, []);

  if (!config) return null; // prevents WebView from rendering before config

  return (
    <Modal visible={visible} animationType="slide">
      <WebView
        originWhitelist={["*"]}
        source={{ html: generateHTML(config) }}
        onMessage={(event) => {
          if (!resolver) return; // guard
          const data = JSON.parse(event.nativeEvent.data);

          if (data.type === "success") {
            resolver?.resolve(data.data);
            setVisible(false);
            setConfig(null);
          }

          if (data.type === "cancel") {
            resolver?.reject("Payment cancelled");
            setVisible(false);
            setConfig(null);
          }

          if (data.type === "error") {
            resolver?.reject(data.data);
            setConfig(null);
          }
          if (data.type === "load") {
            config.onLoad?.();
          }
        }}
      />
    </Modal>
  );
}
