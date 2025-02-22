import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";

export default function AttendenceDetaildScreen() {
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Attendance Details" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
                <View className="w-full items-center">
                    <Text className="text-white">Subhodeep Banerjee</Text>
                </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
