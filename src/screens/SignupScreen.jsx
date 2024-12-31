import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import WorkSpaceScreen from "./WorkSpaceScreen";
import { useNavigation } from "expo-router";
import axios from "axios";
import { backend_Host } from "../../config";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [businessIndustry, setBusinessIndustry] = useState("Select Industry");
  const [teamSize, setTeamSize] = useState("Select Team Size");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    description: "",
  });
  const [showWorkspace, setShowWorkspace] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleValidation = () => {
    const { firstName, lastName, phone, email, password, confirmPassword } =
      formData;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleNextOrSignUp = async () => {
    if (handleValidation()) {
      if (showWorkspace) {
        // Combine formData with workspace data
        const payload = {
          whatsappNo: formData.phone,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          industry: businessIndustry,
          teamSize,
          description: formData.description,
          categories: selectedCategories,
          country: "India", // You can make this dynamic if needed
        };

        console.log("payloaddd", payload);

        try {
          const response = await axios.post(
            `${backend_Host}/users/signup`,
            payload
          );
          Alert.alert("Success", "You have signed up successfully!");
          navigation.navigate("Login");
        } catch (error) {
          console.log("errroooror");
          console.error(error);
          Alert.alert(
            "Signup Failed",
            error.response?.data?.message || "Something went wrong!"
          );
        }
      } else {
        setShowWorkspace(true);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        style={{
          height: 35,
          width: 250,
          alignSelf: "center",
          marginVertical: 25,
        }}
        source={require("../../assets/images/logo.png")}
      />
      {!showWorkspace && (
        <>
          <Text style={styles.subtitle}>Let’s Get Started</Text>
          <Text style={styles.description}>
            Let’s get started by filling out the form below.
          </Text>

          <TextInput
            label="First Name"
            mode="outlined"
            placeholder="First Name"
            placeholderTextColor="#787CA5"
            textColor="#FFFFFF"
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                background: "#37384B",
              },
            }}
          />
          <TextInput
            label="Last Name"
            mode="outlined"
            placeholder="Last Name"
            placeholderTextColor="#787CA5"
            textColor="#FFFFFF"
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                background: "#37384B",
              },
            }}
          />

          <View style={styles.row}>
            <TextInput
              label="+91"
              mode="outlined"
              style={[styles.input, styles.phoneCode]}
              editable={false}
              theme={{ roundness: 25 }}
            />
            <TextInput
              label="WhatsApp Number"
              mode="outlined"
              textColor="#FFFFFF"
              placeholderTextColor="#787CA5"
              style={[styles.input, styles.phoneNumber]}
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
              keyboardType="phone-pad"
              theme={{ roundness: 25 }}
            />
          </View>

          <TextInput
            label="Email Address"
            mode="outlined"
            placeholder="Email Address"
            placeholderTextColor="#787CA5"
            textColor="#FFFFFF"
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                underlineColor: "#37384B",
                placeholder: "#787CA5",
                text: "#FFF",
                background: "#37384B",
              },
            }}
          />

          <TextInput
            label="Password"
            mode="outlined"
            placeholder="**********"
            placeholderTextColor="#787CA5"
            textColor="#FFFFFF"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye" : "eye-off"}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                background: "#37384B",
              },
            }}
          />
          <TextInput
            label="Confirm Password"
            mode="outlined"
            placeholder="**********"
            textColor="#FFFFFF"
            placeholderTextColor="#787CA5"
            style={styles.input}
            secureTextEntry={!confirmPasswordVisible}
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            right={
              <TextInput.Icon
                icon={confirmPasswordVisible ? "eye" : "eye-off"}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              />
            }
            t
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                background: "#37384B",
              },
            }}
          />
        </>
      )}

      {showWorkspace && (
        <WorkSpaceScreen
          handleChange={handleChange}
          formData={formData}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          teamSize={teamSize}
          setTeamSize={setTeamSize}
          businessIndustry={businessIndustry}
          setBusinessIndustry={setBusinessIndustry}
        />
      )}

      <View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleNextOrSignUp}
        >
          {showWorkspace ? "Sign Up" : "Next"}
        </Button>
      </View>
      <Text style={styles.footer}>
        Already a <Text style={styles.highlight}>Zapllonian?</Text>{" "}
        <Text onPress={() => navigation.navigate("Login")} style={styles.link}>
          Login Here
        </Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05071E",
    paddingHorizontal: 10,
    paddingVertical: 30,
   
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  description: {
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#05071E",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneInput: {
    width: 100,
    margin: 5,
  },

  phoneCode: {
    flex: 1,
    marginRight: 10,
  },
  phoneNumber: {
    flex: 3,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#37384B",
    borderRadius: 25,

  },
  footer: {
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 20,
  },
  highlight: {
    color: "#FF9800",
  },
  link: {
    color: "#4E86E4",
    textDecorationLine: "underline",
  },
  workspaceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0E1627",
  },
  workspaceText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SignupScreen;
