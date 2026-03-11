import { Text, View, StyleSheet, Button } from "react-native";

import { Paystack, PaystackModalHost } from "react-native-paystack-modal";

export default function Index() {
  const pay = () => {
    const result = Paystack.newTransaction({
      key: "pk_test_933c6084322010d16586441406fddb3eef0f93b7",
      amount: 1000 * 100, // amount in kobo
      email: "user@example.com",

      onCancel: () => console.log("Payment cancelled"),
      onError: (error) => console.log("Payment error:", error),
      onSuccess: (response) => console.log("Payment successful:", response),
    });
  };

  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>

      <Button title="Paystack Checkout" onPress={() => pay()} />
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
