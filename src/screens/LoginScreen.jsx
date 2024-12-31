import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Checkbox } from "react-native-paper";
import { Route } from "../../routes";

const LoginScreen = () =>  {
  const navigation =useNavigation();
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>ZAPLLO</Text>

      {/* Sub-heading */}
      <Text style={styles.subHeading}>Zapllo Teams</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={true}
        />
        <Text style={styles.eyeIcon}>👁️</Text>
      </View>

      {/* Forgot Password */}
      <Text style={styles.forgotPassword}>Forgot Password?</Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Checkbox value={false} style={styles.checkbox} />
        <Text style={styles.termsText}>
          By clicking continue, you agree to our
          <Text style={styles.linkText}> Terms of Service </Text>
          and
          <Text style={styles.linkText}> Privacy Policy</Text>.
        </Text>
      </View>

      {/* Register Link */}
      <Text style={styles.registerText}>
        Not a <Text style={styles.highlight}>Zapllonian?</Text>
        <TouchableOpacity onPress={()=>navigation.navigate(Route.SIGNUP)}>
        <Text style={styles.linkText}> Register Here</Text>

        </TouchableOpacity>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c20",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 18,
    color: "#aaa",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
    color: "#aaa",
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#aaa",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#7357f0",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    color: "#aaa",
    fontSize: 12,
    flexShrink: 1,
  },
  linkText: {
    color: "#7357f0",
  },
  registerText: {
    color: "#aaa",
    marginTop: 20,
  },
  highlight: {
    color: "#fff",
    fontWeight: "bold",
  },
});
export default LoginScreen; 