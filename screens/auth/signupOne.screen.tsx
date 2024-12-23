import React, { useState } from "react";
import { Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GradientText } from "~/components/GradientText";
import { Dropdown } from 'react-native-element-dropdown';
import InputContainer from "~/components/InputContainer";

export default function SignUpscreen() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
        { label: '+91', value: '+91', icon: require("~/assets/sign-in/india.png") },
        { label: '+222', value: '+222' },
        { label: '+102', value: '+102' },
        { label: '+100', value: '+100' },
        { label: '+69', value: '+69' },
        { label: '++100', value: '++100' },
        { label: '+11', value: '+11' },
        { label: '+12', value: '+12' },
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




    //handle sign in to pass the next page 
    const handleNext = () => {
        const dataToSend = {
            whatsappNo:whatsAppNumber,
            email: userInfo.email,
            password: userInfo.password,
            firstName: userName.firstName,
            lastName: userName.lastName,
            country: numberValue, 
        };
    
        router.push({
            pathname: "/(routes)/signup/pageTwo",
            params: { data: JSON.stringify(dataToSend) }, 
        });
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
                        <View className="flex-row mt-[4.6rem] items-center justify-center mb-9">
                            <Image className="h-9" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
                            <Text className="text-white mt-2 text-2xl font-semibold">Zapllo Teams</Text>
                        </View>

                        {/* middle banner */}
                        <View className="flex items-center justify-center gap-4 mb-4">
                            <Text className="text-white text-2xl font-semibold">Let’s Get Started</Text>
                            <Text className="text-white font-light ">Let's get started by filling out the form below.</Text>
                        </View>

                        {/* first name */}
                        <InputContainer
                            label="First Name"
                            value={userName.firstName}
                            onChangeText={(value) => setUserName({ ...userName, firstName: value })}
                            placeholder="First Name"
                            className="flex-1  text-[#787CA5]"
                        />

                        {/* last name */}
                        <InputContainer
                            label="Last Name"
                            value={userName.lastName}
                            onChangeText={(value) => setUserName({ ...userName, lastName: value })}
                            placeholder="Last Name"
                            className="flex-1  text-[#787CA5] text-sm"
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
                                marginTop: 27,
                                width: 100,
                                

                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#787CA5',
                            }}
                            selectedTextStyle={{
                                fontSize: 10,
                                color: '#787CA5',
                                marginLeft: 2,
                            }}
                            iconStyle={[
                                {
                                    width: 20,
                                    height: 20,
                                    transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }],
                                },
                            ]}
                            containerStyle={{
                                backgroundColor: '#05071E',
                                borderColor: '#37384B',
                                borderRadius: 20, 
                                overflow: 'hidden', 
                               
                            }}
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
                                                borderBottomColor:"#4e5278",
                                                backgroundColor: isSelected ? '#4e5278' : 'transparent',
                                                borderBottomWidth:1,
                                            },
                                        ]}
                                        onPress={() => setNumberValue(item.value)}
                                    >
                                        <Image
                                            source={item.icon}
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
                            className="flex-1  text-[#787CA5]"
                        />

                        {/* password input */}
                        <View className="relative items-center w-full">
                        <InputContainer
                            label="Password"
                            value={userInfo.password}
                            onChangeText={handlePasswordValidation}
                            placeholder="**********"
                            secureTextEntry={!isPasswordVisible}
                            className="flex-1  text-[#787CA5] "
                        />
                            <TouchableOpacity
                                className="absolute top-12 right-10"
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                {isPasswordVisible ? (
                                <Ionicons name="eye-off-outline" size={23} color={"#FFFFFF"} />
                                ) : (
                                <Ionicons name="eye-outline" size={23} color={"#FFFFFF"} />
                                )}
                            </TouchableOpacity>
                        </View>

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
                        <View className="relative items-center w-full">
                        <InputContainer
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordValidation}
                            placeholder="**********"
                            secureTextEntry={!isConfirmPasswordVisible}
                            className="flex-1  text-[#787CA5] "
                        />
                         <TouchableOpacity
                                className="absolute top-12 right-10"
                                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                >
                                {isConfirmPasswordVisible ? (
                                <Ionicons name="eye-off-outline" size={23} color={"#FFFFFF"} />
                                ) : (
                                <Ionicons name="eye-outline" size={23} color={"#FFFFFF"} />
                                )}
                            </TouchableOpacity>
                        </View>

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
                            className={`p-2.5  mt-12 rounded-full w-[89%] h-[3.6rem] items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
                            onPress={handleNext} 
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white  text-center font-semibold ">
                                        Create Work Space
                                    </Text>
                                )
                            }
                        </TouchableOpacity>

                        {/* go to the login page */}
                        <View className="flex-row items-center justify-end mt-6  mb-20">
                            <Text className="text-white font-light mr-1">Already a </Text>
                            <GradientText text="Zapllonian" />
                            <Text className="text-white mr-1">? </Text>
                            <TouchableOpacity onPress={() => router.push("/(routes)/login" as any)}>
                                <Text className="text-white font-semibold">Log In Here</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}