import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    SafeAreaView,
    Platform,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import ProfileButton from "~/components/profile/ProfileButton";
import InputContainer from "~/components/InputContainer";
import { Dropdown } from "react-native-element-dropdown";
import { Button } from "react-native-paper";

// Define the type for your navigation
type RootStackParamList = {
    "(routes)/home/index": undefined; // Define your routes with parameters (if any)
};

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


type NavigationProp = StackNavigationProp<RootStackParamList, "(routes)/home/index">;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [isDropdownOpen,setIsDropdownOpen] = useState(false);
    const [numberValue, setNumberValue] = useState(data[0]?.value || null);
    const [buttonSpinner, setButtonSpinner] = useState(false);

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
                    {/* Navbar */}
                    <NavbarTwo
                        title="Profile"
                        onBackPress={() => navigation.navigate("(routes)/home/index")}
                    />

                    {/* container */}
                    <View className="flex items-center w-[90%] ml-5 mr-5 mt-3  h-full mb-12">
                        {/*profile photo name and role */}
                        <View className="flex flex-row w-full justify-start gap-4 items-center">
                            <View className="bg-white h-16 w-16 rounded-full "></View>
                            <View className=" flex flex-col gap-1 items-start">
                                <Text className="text-white text-xl font-medium">Shubhodeep Banerjee</Text>
                                <Text className=" text-white w-16 text-center bg-[#815BF5] p-1 rounded-lg text-xs">Admin</Text>
                            </View>
                        </View>

                        {/* line */}
                        <View className="h-0.5 w-full bg-[#37384B] mt-9 mb-9"></View>
                        

                        {/* Account Information */}
                        <View className="w-full ">
                        <Text className="text-[#787CA5] text-start text-sm ">Account Information</Text>

                        {/* mail */}
                        <InputContainer
                            label="Email"
                            placeholder="shubhodeep@zapllo.com"
                            className=" p-2.5   rounded-full w-full h-14 text-[#787CA5] "
                        />


                        {/* numbers */}
                        <View className="w-[69%] flex flex-row  items-center gap-2  mt-1">
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
                                // value={whatsAppNumber}
                                // onChangeText={handleWhatsAppNumberValidation}
                                placeholder="7863983914"
                                keyboardType="numeric"
                                className="flex-1 p-2 text-[#787CA5] text-sm"
                            />
                        </View>
                        

                        {/* change pasword buttons */}
                        <TouchableOpacity
                            className={`p-2.5 mt-6  rounded-full w-full h-[3.6rem] items-center flex justify-center bg-[#37384B]`}
                            
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white  text-center font-semibold ">
                                        Change Password
                                    </Text>
                                )
                            }
                        </TouchableOpacity>
                        </View>

                        {/* line */}
                        <View className="h-0.5 w-full bg-[#37384B] mt-9 mb-9"></View>


                        {/* supports */}
                        <View className=" w-full flex flex-col gap-2 items-start">
                            
                            <Text className="text-[#787CA5] text-xs">Support</Text>

                            {/* Tutorials */}
                            <View className="w-full items-center gap-5">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Tutorials</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>

                            {/* My Tickets */}
                            <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">My Tickets</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>

                            {/* Raise a Tickets*/}
                           <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Raise a Tickets</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>

                            {/* Mobile App */}
                            <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Mobile App</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>


                            {/* Events */}
                            <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Events</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>

                            {/* Time zone */}
                            <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Time zone</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>

                            {/* Change Language */}
                            <View className="w-full items-center gap-5 mt-4">
                            <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                                <Text className="text-white text-base">Change Language</Text>
                                <Image 
                                source={require("../../assets/commonAssets/smallGoto.png")}
                                className="w-3 h-3 mb-1"
                                />
                            </TouchableOpacity>
                            <View className="h-0.5 w-full bg-[#37384B] "></View>
                            </View>
                        </View>


                        {/* LOGOUT */}
                        <TouchableOpacity
                            className={`p-2.5 mt-8  rounded-full w-full h-[3.6rem] items-center flex justify-center bg-[#EF4444]`}
                            
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white  text-center font-semibold ">
                                        Change Password
                                    </Text>
                                )
                            }
                        </TouchableOpacity>
                        

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
