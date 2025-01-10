// ReminderModal.tsx
import { View, Text, TouchableOpacity, Image,TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import CustomDropdown from "~/components/customDropDown";
import CustomDropdownComponentTwo from "~/components/customNavbarTwo";



const daysData = [
    { label: 'Days', value: 'Days' },
    { label: 'minutes', value: '' },
    { label: 'hours', value: 'hours' },

  ];



interface ReminderModalProps {
  isReminderModalVisible: boolean;
  setReminderModalVisible: (visible: boolean) => boolean;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isReminderModalVisible,
  setReminderModalVisible,
}) => {
    const [mail,setMail] = useState("");
    const[whatsApp, setWhatsApp] = useState("");
    const[number, setNumber] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState(null); 


    const renderIndustryItem = (item: any) => {
      const isSelected = item.value === selectedIndustry;
  
      return (
        <TouchableOpacity
          style={[
            styles.itemStyle,
            isSelected && styles.selectedDropdownItemStyle, // Apply selected item style
          ]}
          onPress={() => setSelectedIndustry(item.value)} // Update selected item
        >
          <Text
            style={[
              styles.itemTextStyle,
              isSelected && styles.selectedTextStyle, // Apply selected text style
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    };


  return (
    <Modal
      isVisible={isReminderModalVisible}
      onBackdropPress={() => setReminderModalVisible(false)}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5 ">
        <View className="mb-7 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "Lato-Bold" }}
          >
            Add Task Reminders
          </Text>
          <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        <View className=" w-full items-center">
          <View className="flex w-full  flex-row items-center justify-between">
          <View style={styles.input} className="w-[30%]">
                <CustomDropdownComponentTwo
                      data={daysData}
                      selectedValue={selectedIndustry}
                      onSelect={(value) => setSelectedIndustry(value)}
                      placeholder="hii"
                      renderItem={renderIndustryItem}
                    />
              </View>

                <TextInput
                  value={number}
                  onChangeText={(text) => setNumber(text)}
                  placeholder=""
                  className="p-2 border-[#37384B] border rounded-full w-[20%]  h-14"
                />

              <View style={styles.input} className="w-[30%]">
                <CustomDropdownComponentTwo
                      data={daysData}
                      selectedValue={selectedIndustry}
                      onSelect={(value) => setSelectedIndustry(value)}
                      placeholder="hii"
                      renderItem={renderIndustryItem}
                    />
              </View>

            <TouchableOpacity className="h-12 w-12">
              <Image className="h-12 w-12" source={require("../../../assets/Tasks/delete.png")} />
            </TouchableOpacity>
          </View>

        
      
        </View>


        
      </View>
    </Modal>
  );
};

export default ReminderModal;


const styles = StyleSheet.create({
  input: {
 
    borderWidth: 1,
    borderColor: '#37384B',
    padding:9,
    borderRadius: 35,
    height: 48,
    position: 'relative',
  },
  
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },

  placeholderStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 0,
  },
 


})