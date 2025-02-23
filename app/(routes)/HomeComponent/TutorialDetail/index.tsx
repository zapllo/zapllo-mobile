import React from "react";
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { WebView } from "react-native-webview";

export default function TutorialDetailScreen() {
  const navigation = useNavigation();
  const { tutorialLink } = useLocalSearchParams(); // Get tutorial link from navigation params

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavbarTwo title="Tutorial" onBackPress={() => navigation.goBack()} />
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: tutorialLink }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color="#FC8929" style={styles.loader} />
          )}
        />
      </View>
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
