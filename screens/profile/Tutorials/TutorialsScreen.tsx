import { StyleSheet, Text, View, SafeAreaView,TextInput, ScrollView, TouchableOpacity, Image,Dimensions } from "react-native";
import React, { useState } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CustomDropdown from "~/components/customDropDown";

export default function TutorialsScreen() {
  const navigation = useNavigation();
  const [searchTutorials, setSearchTutorials] = useState("")
  const screenWidth = Dimensions.get('window').width;
  const [selectTutorials,setSelectTutorials] = useState("") 

  const tutorials =[
    {label:"all tutorials",value:"all tutorials"},
    
  ]

  
  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E] ">
      <ScrollView
        className="h-full w-full flex-grow "
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {/* Navbar */}
        <NavbarTwo
          title="Tutorials"
          onBackPress={() => navigation.goBack()}
        />
          <View className="h-full w-full items-center  pb-20">
            <View style={[styles.input, { height: 57, justifyContent: 'flex-start', alignItems: 'flex-start', width: "90%", marginBottom: 17, marginTop: 20 }]}>
              <TextInput
                multiline
                style={[styles.inputSome, { textAlignVertical: 'top', paddingTop: 10, width: '100%' }]}
                value={searchTutorials}
                onChangeText={(value) => setSearchTutorials(value)}
                placeholder="Search Tutorial"
                placeholderTextColor="#787CA5"
              />
            </View>
            <View className="w-full items-center mb-4 ">
            <CustomDropdown
                data={tutorials}
                placeholder="Select Filters"
                selectedValue={selectTutorials}
                onSelect={(value) => setSelectTutorials(value)}
              />
            </View>


            <View className="w-[90%] items-center justify-between  flex flex-row">
              
              <TouchableOpacity className="w-[48%]  rounded-3xl h-52 overflow-hidden border relative border-[#37384B] items-center p-4">
              <View className="w-[180%] p-5 bottom-[80%] right-[60%] bg-[#090C2F] h-full absolute rounded-full"></View>
              <View className="w-52 p-5 bottom-[12%] left-[66%] h-32 bg-[#090C2F]  absolute rounded-full"></View>
              <View className="w-32 p-5 top-[72%] right-0 h-32 bg-[#05071E]  absolute"></View>
                <Image className="w-8 h-8 mt-2 z-20" source={require("../../../assets/Tutorials/deligation.png")}/>
                <Text className={`text-white pt-4 ${screenWidth >370 ? "":"text-base"}`} style={{ fontFamily: "LatoBold" }}>Task Delegation</Text>
                <Text className={`text-white pt-16 ${screenWidth >370 ? "":"text-base"}`} style={{ fontFamily: "LatoBold" }}>Task Delegation</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-[48%]  rounded-3xl h-52 overflow-hidden border relative border-[#37384B] items-center p-4">
              <View className="w-[180%] p-5 bottom-[80%] right-[60%] bg-[#090C2F] h-full absolute rounded-full"></View>
              <View className="w-52 p-5 bottom-[12%] left-[66%] h-32 bg-[#090C2F]  absolute rounded-full"></View>
              <View className="w-32 p-5 top-[72%] right-0 h-32 bg-[#05071E]  absolute"></View>
                <Image className="w-8 h-8 mt-2 z-20" source={require("../../../assets/Tutorials/deligation.png")}/>
                <Text className={`text-white pt-4 ${screenWidth >370 ? "":"text-base"}`} style={{ fontFamily: "LatoBold" }}>Task Delegation</Text>
                <Text className={`text-white pt-16 ${screenWidth >370 ? "":"text-base"}`} style={{ fontFamily: "LatoBold" }}>Task Delegation</Text>
              </TouchableOpacity>




          </View>
          </View>



      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
 
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 35,
    width: '100%',
    height: 57,
    position: 'relative',
  },
  inputSome: {
    flex: 1,
    padding: 9,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'lato-Bold',
    
  },
})