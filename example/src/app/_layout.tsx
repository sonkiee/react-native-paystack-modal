import { Stack } from "expo-router";
import { PaystackModalHost } from "react-native-paystack-modal";

export default function RootLayout() {
  return (
    <>
      <Stack />
      <PaystackModalHost />
    </>
  );
}
