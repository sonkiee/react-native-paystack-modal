import React, { useEffect } from "react";
import { registerModal } from "./modal-controller";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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

  useEffect(() => {
    registerModal((cfg: Paystack) => {
      return new Promise((resolve, reject) => {
        setConfig(cfg);
        setResolver({ resolve, reject });
        setVisible(true);
      });
    });
  }, []);

  const closeAndClean = (action?: () => void) => {
    action?.();
    setVisible(false);
    setConfig(null);
    setResolver(null);
  };

  if (!visible || !config) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        closeAndClean(() => resolver?.reject("Payment cancelled"));
      }}
    >
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 16,
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
