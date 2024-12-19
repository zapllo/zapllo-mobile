import React, { useState } from "react";
import { Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { router } from "expo-router";
import { GradientText } from "~/components/GradientText";
import InputContainer from "~/components/InputContainer";

export default function SignUpTwoScreen() {
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
    const [companyName, setCompanyName] = useState("");
    const [description, setDescription] = useState("");

    const data = [
        { id: 1, item: "Sales", selected: false },
        { id: 2, item: "Marketing", selected: false },
        { id: 3, item: "HR/Admin", selected: false },
        { id: 4, item: "General", selected: false },
        { id: 5, item: "Operations", selected: false },
        { id: 6, item: "Automation", selected: false },
        { id: 7, item: "Admin", selected: false },
        { id: 8, item: "UI/UX", selected: false },
    ];
    const [selectedItem, setSelectedItem] = useState(data);

    const onSelect = (item: any) => {
        const newItem = selectedItem.map((val) => {
            if (val.id === item.id) {
                return { ...val, selected: !val.selected }; // Toggle selection
            } else {
                return val;
            }
        });
        setSelectedItem(newItem);
    };

    const industryData = [
        { label: 'Retail/E-Commerce', value: '1' },
        { label: 'Technology', value: '2' },
        { label: 'Service Provider', value: '3' },
        { label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)', value: '4' },
        { label: 'Logistics', value: '5' },
        { label: 'Financial Consultants', value: '6' },
        { label: 'Trading', value: '7' },
        { label: 'Education', value: '8' },
        { label: 'Manufacturing', value: '9' },
        { label: 'Real Estate/Construction/Interior/Architects', value: '10' },
        { label: 'Others', value: '11' },
    ];

    const teamsData = [
        { label: '1-10', value: '1', icon: require("~/assets/sign-in/india.png") },
        { label: '11-20', value: '2' },
        { label: '21-30', value: '3' },
        { label: '31-50', value: '4' },
        { label: '51+', value: '5' },
    ];

    const [selectIndustry, setSelectIndustry] = useState(null);
    const [teamSize, setTeamSize] = useState(null);

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid = 
    companyName.trim() !== "" && 
    selectIndustry !== null && 
    teamSize !== null;


    const renderDropdownItem = (item: any, selectedValue: any) => {
        const isSelected = item.value === selectedValue;
        return (
            <View style={[styles.itemStyle, isSelected && styles.selectedItemStyle]}>
                <Text style={styles.itemTextStyle}>{item.label}</Text>
            </View>
        );
    };
    const handleNext = () => {
        // Handle next action
    };

    return (
        <SafeAreaView className="bg-[#05071E] h-full w-full  items-center ">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
               className="w-full"
            >
                <ScrollView
                className="w-full h-full "
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View className="p-4 h-full w-full items-center">
                        {/* starting banner */}
                        <View className="flex-row items-center justify-center mb-4">
                            <Image className="w-12 h-8" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
                            <Text className="text-white font-bold text-lg ml-2">Zapplo Teams</Text>
                        </View>

                        {/* middle banner */}
                        <View className="flex items-center justify-center gap-3 mb-6">
                            <Text className="text-white font-bold text-xl">Create Your Workspace</Text>
                            <Text className="text-white font-light text-sm">Let's get started by filling out the form below.</Text>
                        </View>

                        {/* Company Name */}
                        <InputContainer
                            label="Company Name"
                            value={companyName}
                            onChangeText={(value) => setCompanyName(value)}
                            placeholder="Company Name"
                            
                        />

                    {/* drop down Business Industry names */}
                    <View style={styles.input}>
                        <Text style={[styles.baseName, { fontFamily: "Nunito_400Regular" }]}>Business Industry</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            renderItem={(item) => renderDropdownItem(item, item.value)}
                            iconStyle={styles.iconStyle}
                            data={industryData}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Business Industry"
                            searchPlaceholder="Search..."
                            value={selectIndustry}
                            onChange={(item: any) => {
                                setSelectIndustry(item.value);
                            }}
                        />
                    </View>

                    {/* drop down team size names */}
                    <View style={styles.input}>
                        <Text style={[styles.baseName, { fontFamily: "Nunito_400Regular" }]}>Team Size</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            renderItem={(item) => renderDropdownItem(item, item.value)}
                            iconStyle={styles.iconStyle}
                            data={teamsData}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Team Size"
                            searchPlaceholder="Search..."
                            value={teamSize}
                            onChange={(item: any) => {
                                setTeamSize(item.value);
                            }}
                        />
                    </View>

                        {/* Description */}
                        <View style={[styles.input, { height: 100, justifyContent: "flex-start", alignItems: "flex-start" }]}>
                        <TextInput
                            multiline
                            
                            style={[styles.inputSome,{ textAlignVertical: 'top', paddingTop: 10 }]}
                            value={description}
                            onChangeText={(value) => setDescription(value)}
                            placeholder="Description"
                            placeholderTextColor="#787CA5"
                        ></TextInput>
                        </View>

                        <View className="flex items-center justify-center gap-3 mb-6">
                            <Text className="text-white font-light text-sm ">Select the categories that are relevant to your business</Text>
                        </View>

                        {/* Render buttons without scrolling */}
                        <View className="flex-row flex-wrap justify-start gap-1 w-full mb-4">
                            {selectedItem.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className={`w-1/4 h-10 m-1 rounded-full items-center justify-center ${item.selected ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
                                    onPress={() => onSelect(item)}
                                >
                                    <Text className="text-white text-xs">{item.item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex items-center  gap-3 mb-6">
                            <Text className="text-white font-light text-xs text-center">Don't worry you can add more later in the Settings panel</Text>
                        </View>

                        {/* button sign up */}
                        <TouchableOpacity
                            className={`p-2.5 mt-16 rounded-full w-11/12 h-14 items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
                            onPress={() => router.push("" as any)}
                        >
                            {
                                buttonSpinner ? (
                                    <ActivityIndicator size="small" color={"white"} />
                                ) : (
                                    <Text className="text-white text-center text-sm font-bold">
                                        Sign Up
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
}

const styles = StyleSheet.create({



  input:{
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    
    borderRadius: 35,
    width:"90%",
    height:57,
    position:"relative",
    
  },
  baseName:{
    color:"white",
    position:"absolute",
    top:-9,
    left:25,
    backgroundColor:"#05071E",
    paddingRight:5,
    paddingLeft:5,
    fontSize:10,
    fontWeight:200
  },
  inputSome:{
    flex:1,
    padding:8,
    color:"#787CA5",
    fontSize:12
  },
 


    dropdown: {
        position:"absolute",
        width:"100%",
        height:52,
        
        
    },
    itemStyle: {
        padding: 15,
        borderBottomColor:"gray",
        borderBottomWidth:1,
        
    },
    itemTextStyle: {
        color: '#FFFFFF', // Text color for each item
    },
    selectedItemStyle: {
        backgroundColor: '#a492d8', // Background color for selected item
    },

    placeholderStyle: {
      fontSize: 13,
      color:"#787CA5",
      fontWeight:300,
      paddingLeft:22,
    },
    selectedTextStyle: {
      fontSize: 13,
      color:"#787CA5",
      fontWeight:300,
      paddingLeft:22,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      marginRight: 5,
      borderColor:"white"
    },


});
