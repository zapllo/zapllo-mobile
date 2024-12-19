import { ScrollView, Text, View, Image, SafeAreaView, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { GradientText } from "~/components/GradientText";
import { Dropdown } from 'react-native-element-dropdown';
import InputContainer from "~/components/InputContainer";


export default function SignUpscreen() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [buttonSpinner, setButtonSpinner] = useState(false);
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState({
        password: "",
        confirmPassword: "",
        whatsAppNumber: ""
    });
    const [userName, setUserName] = useState({
        firstName: "",
        lastName: ""
    });

    const data = [
        { label: '+91', value: '1', icon: require("~/assets/sign-in/india.png") },
        { label: '+222', value: '2' },
        { label: '+102', value: '3' },
        { label: '+100', value: '4' },
        { label: '+69', value: '5' },
        { label: '++100', value: '6' },
        { label: '+11', value: '7' },
        { label: '+12', value: '8' },
    ];

    const [numberValue, setNumberValue] = useState(data[0]?.value || null);
    const [whatsAppNumber, setWhatsAppNumber] = useState("");

    const handlePasswordValidation = (value: string) => {
        const password = value;
        const passwordSpecialCharecter = /(?=.*[!@#$&*])/;
        const passwordOneNumber = /(?=.*[0-9])/;
        const passwordSixValue = /(?=.{6,})/;

        if (!passwordSpecialCharecter.test(password)) {
            setError({
                ...error,
                password: "Write at least one special charecter"
            });
            setUserInfo({ ...userInfo, password: "" });

        } else if (!passwordOneNumber.test(password)) {
            setError({
                ...error,
                password: "write atleast one number"
            });
            setUserInfo({ ...userInfo, password: "" });
        } else if (!passwordSixValue.test(password)) {
            setError({
                ...error,
                password: "write at least 6 charecters "
            });
            setUserInfo({ ...userInfo, password: "" });
        } else {
            setError({
                ...error,
                password: ""
            });
        }
        setUserInfo({ ...userInfo, password: value })

    };

    const handleConfirmPasswordValidation = (value: string) => {
        setConfirmPassword(value);
        if (value !== userInfo.password) {
            setError({
                ...error,
                confirmPassword: "Passwords do not match"
            });
        } else {
            setError({
                ...error,
                confirmPassword: ""
            });
        }
    };

    const handleWhatsAppNumberValidation = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setWhatsAppNumber(numericValue);

        if (numberValue === '1' && numericValue.length !== 10) {
            setError({ ...error, whatsAppNumber: "Enter a valid 10-digit number" });
        } else {
            setError({ ...error, whatsAppNumber: "" });
        }
    };

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const areNamesValid = () => {
        return userName.firstName.trim().length > 0 && userName.lastName.trim().length > 0;
    };

    const isFormValid = isEmailValid(userInfo.email) && !error.password && areNamesValid() && confirmPassword === userInfo.password && (!error.whatsAppNumber && whatsAppNumber.length > 0);

    const handleNext = () => {
        // Handle next action
    }

    return (
        <SafeAreaView className="bg-[#05071E] h-full">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className="p-4 flex items-center w-full h-full">
                        {/* starting banner */}
                        <View className="flex-row items-center justify-center mb-4">
                            <Image className="w-16 h-8" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
                            <Text className="text-white font-bold text-lg ml-2">Zapplo Teams</Text>
                        </View>

                        {/* middle banner */}
                        <View className="flex items-center justify-center gap-3 mb-6">
                            <Text className="text-white font-bold text-xl">Let’s Get Started</Text>
                            <Text className="text-white font-light text-sm">Let's get started by filling out the form below.</Text>
                        </View>

                        {/* first name */}
                        <InputContainer
                            label="First Name"
                            value={userName.firstName}
                            onChangeText={(value) => setUserName({ ...userName, firstName: value })}
                            placeholder="First Name"
                            className="flex-1 p-2 text-[#787CA5] text-sm"
                        />

                        {/* last name */}
                        <InputContainer
                            label="Last Name"
                            value={userName.lastName}
                            onChangeText={(value) => setUserName({ ...userName, lastName: value })}
                            placeholder="Last Name"
                            className="flex-1 p-2 text-[#787CA5] text-sm"
                        />

                        {/* drop down numbers and phone numbers */}
                        <View className="w-[69%] flex-row items-center justify-center gap-2 mb-4">
                        <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={data}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select item"
                        searchPlaceholder="Search..."
                        value={numberValue}
                        onChange={(item: any) => {
                            setNumberValue(item.value);
                        }}
                        renderLeftIcon={() => {
                            const selectedItem = data.find((item) => item.value === numberValue);
                            return (
                                <Image
                                    source={selectedItem?.icon}
                                    style={{ width: 15, height: 20, marginRight: 5 }}
                                    resizeMode="contain"
                                />
                            );
                        }}
                    />

                            {/* numbers */}
                            <InputContainer
                                label="WhatsApp Number"
                                value={whatsAppNumber}
                                onChangeText={handleWhatsAppNumberValidation}
                                placeholder="7863983914"
                                keyboardType="numeric"
                                className="flex-1 p-2 text-[#787CA5] text-sm"
                                
                            />
                        </View>

                        {/* email input */}
                        <InputContainer
                            label="Email Address"
                            value={userInfo.email}
                            onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
                            placeholder="Email Address"
                            className="flex-1 p-2 text-[#787CA5] text-sm"
                        />

                        {/* password input */}
                        <InputContainer
                            label="Password"
                            value={userInfo.password}
                            onChangeText={handlePasswordValidation}
                            placeholder="**********"
                            secureTextEntry={!isPasswordVisible}
                            className="flex-1 p-2 text-[#787CA5] text-sm"
                        />

                        {/* when password error occurs then show red color */}
                        {error.password && (
                            <View className="flex-row items-center gap-1 mt-1">
                                <Entypo name="cross" size={18} color={"red"} />
                                <Text className="text-red-500 text-xs">
                                    {error.password}
                                </Text>
                            </View>
                        )}

                        {/* confirm password */}
                        <InputContainer
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordValidation}
                            placeholder="**********"
                            secureTextEntry={!isPasswordVisible}
                            className="flex-1 p-2 text-[#787CA5] text-sm"
                        />

                        {/* when confirm password occurs  */}
                        {error.confirmPassword && (
                            <View className="flex-row items-center gap-1 mt-1">
                                <Entypo name="cross" size={18} color={"red"} />
                                <Text className="text-red-500 text-xs">
                                    {error.confirmPassword}
                                </Text>
                            </View>
                        )}

                        {/* button next */}
                        <TouchableOpacity
                            className={`p-2.5 mt-16 rounded-full w-11/12 h-14 items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
                            onPress={() => router.push("/(routes)/signup/pageTwo" as any)}
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white text-center text-sm font-bold">
                                        Next
                                    </Text>
                                )
                            }
                        </TouchableOpacity>

                        {/* go to the login page */}
                        <View className="flex-row items-center justify-end mt-10 gap-1">
                            <Text className="text-white font-light text-xs">Already a </Text>
                            <GradientText text="Zapllonian" />
                            <Text className="text-white text-xs">? </Text>
                            <TouchableOpacity onPress={() => router.push("/(routes)/login" as any)}>
                                <Text className="text-white">Log In Here</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
        dropdown: {
          borderWidth: 1,
          borderColor: '#37384B',
          padding: 10,
          marginTop: 25,
          borderRadius: 35,
          position:"relative",
          width:100,
          height:52
          
      },

      placeholderStyle: {
        fontSize: 16,
      },
      selectedTextStyle: {
        fontSize: 10,
        color:"#787CA5",
        fontWeight:700
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
        marginRight: 5,
      },
})