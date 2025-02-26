import React from "react";
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { WebView } from "react-native-webview";
import { TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function TutorialDetailScreen() {
  const navigation = useNavigation();
  const { tutorialLink } = useLocalSearchParams(); // Get tutorial link from navigation params

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-primary flex-1">

        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign className="ml-6" name="arrowleft" size={26} color="#ffffff"  />
        </TouchableOpacity>
  
        <WebView
          source={{ uri: tutorialLink }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color="#FC8929" style={styles.loader} />
          )}
        />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
