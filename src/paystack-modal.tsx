import React, { useEffect } from "react";
import { registerModal } from "./modal-controller";
import { Modal } from "react-native";
import { WebView } from "react-native-webview";
import { generateHTML } from "./html-template";
import { Paystack } from "./types";

export default function PayStackModalHost() {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<Paystack | null>(null);
  const [resolver, setResolver] = React.useState<{
    resolve: (response: any) => void;
    reject: (error?: any) => void;
  } | null>(null);

  const cleanupTimeoutRef = React.useRef<any>(null);

  useEffect(() => {
    registerModal((cfg: Paystack) => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      return new Promise((resolve, reject) => {
        setConfig(cfg);
        setResolver({ resolve, reject });
        setVisible(true);
      });
    });

    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const closeAndClean = (action?: () => void) => {
    action?.();
    setVisible(false);
    cleanupTimeoutRef.current = setTimeout(() => {
      setConfig(null);
      setResolver(null);
    }, 500);
  };

  if (!config) return null; // prevents WebView from rendering before config

  return (
    <Modal
      visible={visible}
      onRequestClose={() => {
        closeAndClean(() => resolver?.reject("Payment cancelled"));
      }}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: generateHTML(config) }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);

          if (data.type === "success") {
            closeAndClean(() => resolver?.resolve(data.data));
          }

          if (data.type === "cancel") {
            closeAndClean(() => resolver?.reject("Payment cancelled"));
          }

          if (data.type === "error") {
            closeAndClean(() => resolver?.reject(data.data));
          }

          if (data.type === "load") {
            config.onLoad?.();
          }
        }}
      />
    </Modal>
  );
}
