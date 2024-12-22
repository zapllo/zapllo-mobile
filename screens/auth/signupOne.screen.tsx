import React, { useState } from "react";
import { Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
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
    const [isDropdownOpen,setIsDropdownOpen] = useState(false);

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
                password: "Write at least one special character"
            });
            setUserInfo({ ...userInfo, password: "" });

        } else if (!passwordOneNumber.test(password)) {
            setError({
                ...error,
                password: "Write at least one number"
            });
            setUserInfo({ ...userInfo, password: "" });
        } else if (!passwordSixValue.test(password)) {
            setError({
                ...error,
                password: "Write at least 6 characters"
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
        <SafeAreaView className="bg-[#05071E] h-full w-full">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className="flex items-center w-full h-full">
                        {/* starting banner */}
                        <View className="flex-row mt-14 items-center justify-center mb-9">
                            <Image className="h-9" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
                            <Text className="text-white mt-2 text-xl">Zapplo Teams</Text>
                        </View>

                        {/* middle banner */}
                        <View className="flex items-center justify-center gap-4 mb-6">
                            <Text className="text-white text-2xl">Let’s Get Started</Text>
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
                        <View className="w-[69%] flex flex-row  items-center justify-center gap-2 mb-4">
                        <Dropdown
                            style={{
                                borderWidth: 1,
                                borderColor: '#37384B',
                                borderRadius: 29,
                                backgroundColor: '#05071E',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                height: 55,
                                marginTop:27,
                                width: 100,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#787CA5',
                            }}
                            selectedTextStyle={{
                                fontSize: 10,
                                color: '#FFFFFF',
                                marginLeft:2
                                
                            }}
                            inputSearchStyle={{
                                fontSize: 14,
                                color: '#FFFFFF',
                            }}
                            iconStyle={[
                                {
                                    width: 20,
                                    height: 20,
                                    transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }],
                                },
                            ]}
                            containerStyle={{backgroundColor:"#05071E", borderColor:"#37384B"}}
                            data={data}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Code"
                            value={numberValue}
                            onFocus={() => setIsDropdownOpen(true)} // Handle open state
                            onBlur={() => setIsDropdownOpen(false)} // Handle close state
                            onChange={(item) => setNumberValue(item.value)} // Handle selection
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
                            renderItem={(item) => {
                                const isSelected = item.value === numberValue;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                padding: 10,
                                                backgroundColor: isSelected ? '#4e5278' : '#05071E',
                                            },
                                        ]}
                                        onPress={() => setNumberValue(item.value)}
                                    >
                                        <Image
                                            source={item.icon }
                                            style={{ width: 15, height: 20, marginRight: 10 }}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: isSelected ? '#FFFFFF' : '#787CA5',
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                            }}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
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
                            <View className="flex-row items-center gap-1 w-[82%]">
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

                        {/* when confirm password occurs */}
                        {error.confirmPassword && (
                            <View className="flex-row items-center gap-1 w-[82%]">
                                <Entypo name="cross" size={18} color={"red"} />
                                <Text className="text-red-500 text-xs">
                                    {error.confirmPassword}
                                </Text>
                            </View>
                        )}

                        {/* button next */}
                        <TouchableOpacity
                            className={`p-2.5  mt-12 rounded-full w-11/12 h-16 items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
                            onPress={() => router.push("/(routes)/signup/pageTwo" as any)}
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white text-center ">
                                        Create Work Space
                                    </Text>
                                )
                            }
                        </TouchableOpacity>

                        {/* go to the login page */}
                        <View className="flex-row items-center justify-end mt-4 gap-1 mb-8">
                            <Text className="text-white font-light">Already a </Text>
                            <GradientText text="Zapllonian" />
                            <Text className="text-white">? </Text>
                            <TouchableOpacity onPress={() => router.push("/(routes)/login" as any)}>
                                <Text className="text-white">Log In Here</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}