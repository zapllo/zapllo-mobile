import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";

export default function SetPayslipScreen() {
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Set Payslip" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
