import { Text, View, StyleSheet, Button } from "react-native";

import { Paystack, PaystackModalHost } from "react-native-paystack";

export default function Index() {
  const pay = () => {
    const result = Paystack.newTransaction({
      key: "pk_test_933c69k902008",
      amount: 100000,
      email: "user@example.com",

      onCancel: () => console.log("Payment cancelled"),
      onError: (error) => console.log("Payment error:", error),
      onSuccess: (response) => console.log("Payment successful:", response),
    });
  };

  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>

      <Button title="Checkout" onPress={() => pay()} />
      <PaystackModalHost />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
