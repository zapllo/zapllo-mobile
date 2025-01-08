// ReminderModal.tsx
import { View, Text, TouchableOpacity, Image,TextInput } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import CustomDropdown from "~/components/customDropDown";



const daysData = [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'Next Week', value: 'Next Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Next Month', value: 'Next Month' },
    { label: 'This Year', value: 'This Year' },
    { label: 'All Time', value: 'All Time' },
    { label: 'Custom', value: 'Custom' },
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
            <View className="flex-1">
              <CustomDropdown
                data={daysData}
                placeholder="Email"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
              />
            </View>

            <TextInput
              value={number}
              onChangeText={(text) => setNumber(text)}
              placeholder="2"
              className="p-3 border-[#37384B] border rounded-full w-[20%]  h-14"
            />

            <View className="flex-1 ml-2">
              <CustomDropdown
                data={daysData}
                placeholder="days"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
              />
            </View>

            <TouchableOpacity className="h-12 w-12">
              <Image className="h-12 w-12" source={require("../../../assets/Tasks/delete.png")} />
            </TouchableOpacity>
          </View>

        
          <View className="flex w-full flex-row items-center justify-between">
            <View className="flex-1 ">
              <CustomDropdown
                data={daysData}
                placeholder="Email"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
              />
            </View>

            <TextInput
              value={number}
              onChangeText={(text) => setNumber(text)}
              placeholder="2"
              className="p-3 border-[#37384B] border rounded-full w-[20%] h-14"
            />

            <View className="flex-1 ">
              <CustomDropdown
                data={daysData}
                placeholder="days"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
              />
            </View>

            <TouchableOpacity className="h-12 w-12">
              <Image className="h-12 w-12" source={require("../../../assets/Tasks/delete.png")} />
            </TouchableOpacity>
          </View>

          <View className="flex w-full flex-row items-center justify-between">
            <View className="flex-1 ">
              <CustomDropdown
                data={daysData}
                placeholder="Email"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
              />
            </View>

            <TextInput
              value={number}
              onChangeText={(text) => setNumber(text)}
              placeholder="2"
              className="p-3 border-[#37384B] border rounded-full w-[20%] h-14"
            />

            <View className="flex-1 ">
              <CustomDropdown
                data={daysData}
                placeholder="days"
                selectedValue={mail}
                onSelect={(value) => setMail(value)}
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