import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import DateRangeDropdown from '~/components/DateRangeDropdown/DateRangeDropdown';
import Modal from 'react-native-modal';
import CustomDropdownComponentTwo from '~/components/customNavbarTwo';
import axios from 'axios';
import { backend_Host } from '~/config';
import { LinearGradient } from 'expo-linear-gradient';
import CheckRound from '~/components/CheckRound';

export default function FaceRegistrationScreen() {
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [users, setUsers] = useState([]);
  const [isFaceModalOpen,setIsFaceModalOpen] = useState(false);
  const [isChecked,setIsChecked] = useState(true)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/organization`);
        const formattedData = response.data.data.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName}`,
        }));
        setUsers(formattedData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDateRangeChange = (range) => {
    console.log('Selected date range:', range);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const toggleFaceModal = () =>{
    setIsFaceModalOpen(!isFaceModalOpen);
  };
  const handelSelect = () =>{
    setIsChecked(!isChecked);
  }

  const renderDropdownItem = (item) => (
    <TouchableOpacity
      style={styles.itemStyle}
      onPress={() => setSelectedEmployee(item.value)}
    >
      <Text style={styles.itemTextStyle}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Face Register" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
              <View className="w-full items-start flex flex-row justify-between mb-2">
                <View className="w-[65%]">
                  <DateRangeDropdown
                    onRangeChange={handleDateRangeChange}
                    initialValue="This Week"
                    placeholder="Select Date Range"
                    includeNext={true}
                  />
                </View>
                <TouchableOpacity
                  className="h-14 w-14 rounded-full bg-[#37384B] mt-3"
                  onPress={toggleFilterModal}
                >
                  <Image
                    source={require('~/assets/commonAssets/filter.png')}
                    className="h-full w-full"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={toggleFaceModal}
                  className="h-14 w-14 rounded-full mt-3">
                  <Image
                    source={require('~/assets/Attendence/faceIdentifier.png')}
                    className="h-full w-full"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.input,
                  {
                    height: 57,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    width: '100%',
                  },
                ]}
              >
                <TextInput
                  multiline
                  style={[
                    styles.inputSome,
                    { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                  ]}
                  value={searchUser}
                  onChangeText={(value) => setSearchUser(value)}
                  placeholder="Search"
                  placeholderTextColor="#787CA5"
                />
              </View>

              <View className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2">
                <View className="border rounded-2xl flex flex-row justify-between">
                  <View className="flex flex-row items-center gap-4">
                    <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                      Subhodeep Banerjee
                    </Text>
                    <Text
                      className="text-white text-xs p-2 rounded-lg px-4 bg-[#06D6A0]"
                      style={{ fontFamily: 'LatoBold' }}
                    >
                      Approved
                    </Text>
                  </View>
                  <TouchableOpacity className="w-5 h-8">
                    <Image
                      className="w-full h-full"
                      source={require('../../../../assets/Tasks/deleteTwo.png')}
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row items-center gap-2">
                  <View className="bg-white w-8 h-8 rounded-full"></View>
                  <View className="bg-white w-8 h-8 rounded-full"></View>
                  <View className="bg-white w-8 h-8 rounded-full"></View>
                </View>
              </View>
            </View>

            {/* FACE MODAL */}
            <Modal
              isVisible={isFaceModalOpen}
              onBackdropPress={toggleFaceModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-16">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    Register Faces
                  </Text>
                  <TouchableOpacity onPress={toggleFaceModal}>
                    <Image
                      source={require('../../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
                  Register New Employee Faces
                </Text>
                <Text className="text-[#787CA5] text-xs mb-7 mt-1" style={{ fontFamily: 'Lato' }}>
                  Upload only 3 Images of Employee and submit those images
                </Text>
                <View style={styles.input}>
                  <CustomDropdownComponentTwo
                    data={users}
                    selectedValue={selectedEmployee}
                    onSelect={(value) => setSelectedEmployee(value)}
                    placeholder="Select User"
                    renderItem={renderDropdownItem}
                  />
                </View>
                <View className='flex flex-row items-center justify-between mt-4'>
                  <TouchableOpacity className='border border-dashed border-[#815BF5] p-8 rounded-xl'>
                    <Image className='h-12 w-12' source={require("../../../../assets/Attendence/AddImage.png")}/>
                  </TouchableOpacity>
                  <TouchableOpacity className='border border-dashed border-[#815BF5] p-8 rounded-xl'>
                    <Image className='h-12 w-12' source={require("../../../../assets/Attendence/AddImage.png")}/>
                  </TouchableOpacity>
                  <TouchableOpacity className='border border-dashed border-[#815BF5] p-8 rounded-xl'>
                    <Image className='h-12 w-12' source={require("../../../../assets/Attendence/AddImage.png")}/>
                  </TouchableOpacity>
                </View>
                <Text className='text-[#787CA5] text-xs mt-2'>Click to upload your document.</Text>
                <TouchableOpacity className='flex h-[4rem] items-center justify-center rounded-full mt-10'>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={["#815BF5", "#FC8929"]}
                    style={styles.gradient}
                  >
                    <Text className='text-white'>Register New Face</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* FILTER MODAL */}
            <Modal
              isVisible={isFilterModalVisible}
              onBackdropPress={toggleFilterModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-16">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    Filters
                  </Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <Image
                      source={require('../../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>
                <Text className='text-white mb-7 mt-4'>States</Text>
                <View className='flex flex-col gap-2'>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>All</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Pending</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Approved</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Rejected</Text>
                  </View>
                </View>
                <View className='flex flex-row items-center justify-center gap-5 mt-8'>
                  <TouchableOpacity className='bg-[#37384B] p-4 rounded-full w-[45%] items-center'>
                    <Text className='text-white text-sm'>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className=' rounded-full w-[45%]  items-center'>
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={["#815BF5", "#FC8929"]}
                      style={styles.gradient}
                    >
                      <Text className='text-white text-sm'>Apply</Text>
                    </LinearGradient>                   
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    borderRadius: 35,
    width: '100%',
    height: 57,
    position: 'relative',
    marginBottom: 20,
  },
  
  inputSome: {
    flex: 1,
    padding: 9,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LatoBold',
  },
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
});