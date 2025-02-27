import { Image, Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { Camera, CameraMode, CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import Navbar from "~/components/navbar";
import { LinearGradient } from "expo-linear-gradient";
import Modal from 'react-native-modal';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const screenWidth = Dimensions.get('window').width;
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('My');
  const [flash,setFlash] = useState<FlashMode>("off");
  const [torch, setTorch] = useState(false);
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const cameraRef = useRef<Camera>(null);
  const [cameraZoom, setCameraZoom] = React.useState<number>(0);

  const handleLoginPress = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      requestPermission();
    } else {
      setModalVisible(true);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
    const handleOptionPress = (option: string) => {
      setSelectedOption(option);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
   
    };
    const capturePhoto = async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo captured:', photo.uri);
      }
    };

  // Improved torch toggle with proper state management
  const toggleFlash = useCallback(() => {
    if (facing === 'back') {
      // First, turn off both flash and torch
      setFlash("off");
      setCameraTorch(false);

      // Then set the new states after a small delay
      setTimeout(() => {
        if (flash === "off") {
          setFlash("on");
          setCameraTorch(true);
        } else {
          setFlash("off");
          setCameraTorch(false);
        }
      }, 100);
    }
  }, [facing, flash]);


  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View className=" w-full items-center flex gap-8 mt-14 mb-20 ">
                <Text className="text-white text-3xl" style={{fontFamily:"LatoBold"}}>10:00 AM</Text>
                <Text className="text-white mb-8" style={{fontFamily:"LatoBold"}}>Jan 22, 2025 - Wednesday</Text>

                {/* log in */}
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={["#815BF5", "#3F16BD"]}
                    style={styles.gradientBorderOne} 
                >
                  <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      colors={["#3F16BD", "#815BF5"]}  
                      style={styles.gradientBorderTwo}              
                  >
                    <TouchableOpacity
                      className=" w-52 h-52 rounded-full items-center"
                      onPress={handleLoginPress}
                    >
                        <LinearGradient
                        start={{ x: 0, y:0 }}
                        end={{ x: 1, y: 0 }}
                        colors={["#0A0D28", "#37384B"]}
                        style={styles.gradientButton}
                        >
                            <Image style={{objectFit:"scale-down"}} className="h-28 w-32" source={require("../../../assets/Attendence/tap.png")}/>
                            <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>Log in</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>                  
                </LinearGradient>

                {/* Modal for Camera */}
                <Modal
                  isVisible={modalVisible}
                  style={{ margin: 0, justifyContent: 'flex-end' }}
                  animationIn="slideInUp"
                  animationOut="slideOutDown"
                  onBackdropPress={() => {
                    setModalVisible(false);
                  }}
                >
                  <View className="mt-16 rounded-t-3xl bg-[#060924]  h-[95%]">

                    {cameraPermission?.granted && (
                      <View style={styles.cameraContainer}>
                        <CameraView 
                        zoom={cameraZoom}
                        ref={cameraRef}
                        style={styles.camera} 
                        facing={facing}
                        flash={facing === 'back' ? flash : 'off'}
                        enableTorch={facing === 'back' ? cameraTorch : false}
                        
                        >
                        <View className=" absolute  p-5 flex w-full flex-row items-center justify-between">
                            <Image className="h-8 w-48" source={require("../../../assets/Attendence/cameraAiZapllo.png")}/>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                              <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                            </TouchableOpacity>
                          </View>  
                          <View className="flex items-center gap-2 flex-row absolute bottom-0 right-0 bg-[#06D6A0] p-2 rounded-tl-xl" style={{backgroundColor: "rgba(33, 225, 158, 0.6)"}}>
                            <Image style={{opacity:1000}} className="w-6 h-6" source={require("../../../assets/Attendence/office.png")}/>
                            <Text className="text-white text-xs" style={{fontFamily:"LatoBold"}}>You are in office reach</Text>
                          </View>

                        </CameraView>
                      </View>
                    )}
                    <View className="w-full items-start flex flex-col gap-2 ml-5 mt-2">
                      <Text className="text-white "style={{fontFamily:"LatoBold"}}>Login at 20:43:06</Text>
                      <Text className="text-white text-xs"style={{fontFamily:"LatoBold"}}>Lat:22.608858</Text>
                      <Text className="text-xs text-white"style={{fontFamily:"LatoBold"}}>Long: 88.4163671</Text>
                    </View>

                    <View className="w-full items-center flex flex-row justify-center gap-12 mb-3">

                      {
                        facing === 'back' ?
                        <TouchableOpacity 
                        className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                        onPress={toggleFlash}
                      >
                        <Ionicons 
                          name={flash === "off" ? "flash-off-outline" : "flash-outline"} 
                          size={30} 
                          color="white"
                        />
                      </TouchableOpacity>
                      :
                      <TouchableOpacity 
                      className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                      
                    >
                      <Ionicons 
                        name={"flash-off-outline" } 
                        size={30} 
                        color="white"
                      />
                    </TouchableOpacity>
                      }

                    <TouchableOpacity
                    onPress={capturePhoto}
                    >
                        <MaterialIcons name="radio-button-on" size={80} color={"white"}/>
                      </TouchableOpacity>
                      <TouchableOpacity
                      onPress={toggleCameraFacing}
                      className=" bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex ">
                        <Ionicons name="camera-reverse-outline" size={30} color={"white"}/>
                      </TouchableOpacity>
                    </View>
                    <View className="items-center border border-[#676B93] w-[95%] px-1.5 py-1.5 rounded-full  mb-5 ml-3">
                    <View className="w-full flex flex-row items-center justify-between">
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('My')}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'My' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                            style={styles.tablet}
                          >
                            <Text className={`text-sm  ${selectedOption === 'My' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>My Details</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('Team')}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'Team' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                            style={styles.tablet}
                          >
                            <Text className={`text-sm  ${selectedOption === 'Team' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Team Details</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>              
                    </View>                    

                  
                  </View>
                </Modal>
            </View>
            <View className="bg-[#10122d] h-full rounded-t-3xl flex items-center p-5 pb-16 ">
               <Text className="text-white p-2 text-xl w-full" style={{fontFamily:"LatoBold"}}>Today's Logs</Text>
              <View className=" m-6 mt-8 flex items-center  justify-around flex-row  w-full">

                <View className=" w-1/3 flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockWhite.png")}/>
                  <Text className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`}style={{fontFamily:"LatoBold"}} >09:00 AM</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock In</Text>
                </View>

                <View className="w-1/3  flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockGray.png")}/>
                  <Text className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`} style={{fontFamily:"LatoBold"}}>--:--</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
                </View>

                <View className="w-1/3  flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/hours.png")}/>
                  <Text 
                  
                  className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`} style={{fontFamily:"LatoBold"}}>--:--</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
                </View>


              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientBorderOne:{
    borderRadius: 1000,
    width:228,
    height:228,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    
  },
  gradientBorderTwo:{
    borderRadius: 1000,
    width:202,
    height:202,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
    
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    gap:"3",
    
  },
  cameraContainer: {
    display:"flex",
    justifyContent: 'center',
    marginHorizontal:4,
    height:"65%",
    borderRadius:100,
  },
  camera: {
    flex: 1,
    borderRadius:100,
    
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width:"100%",
    display:"flex",
    alignItems:"center",
  },
});
