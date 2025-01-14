// ReminderModal.tsx
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Keyboard, Animated } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Modal from "react-native-modal";
import CustomDropdownComponentThree from "~/components/customDropdownThree";

const daysData = [
    { label: 'Days', value: 'Days' },
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
    const [mail, setMail] = useState("");
    const [whatsApp, setWhatsApp] = useState("");
    const [number, setNumber] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const animatedHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          (event) => {
            Animated.timing(animatedHeight, {
              toValue: event.endCoordinates.height,
              duration: 300,
              useNativeDriver: false,
            }).start();
            setKeyboardHeight(event.endCoordinates.height);
          }
        );
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
          Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
          setKeyboardHeight(0);
        });

        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
    }, []);

    const renderIndustryItem = (item: any) => {
      const isSelected = item.value === selectedIndustry;
  
      return (
        <TouchableOpacity
          style={[
            styles.itemStyle,
            isSelected && styles.selectedDropdownItemStyle,
          ]}
          onPress={() => setSelectedIndustry(item.value)}
        >
          <Text
            style={[
              styles.itemTextStyle,
              isSelected && styles.selectedTextStyle,
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
      <Animated.View style={[styles.modalContent, { marginBottom: animatedHeight }]}>
        <View className="mb-7 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "LatoBold" }}
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
                <CustomDropdownComponentThree
                      data={daysData}
                      selectedValue={selectedIndustry}
                      onSelect={(value) => setSelectedIndustry(value)}
                      renderItem={renderIndustryItem}
                    />
              </View>

                <TextInput
                  value={number}
                  onChangeText={(text) => setNumber(text)}
                  placeholder=""
                  className="p-2 border-[#37384B] border text-white rounded-full w-[20%]  h-14"
                />

              <View style={styles.input} className="w-[30%]">
                <CustomDropdownComponentThree
                      data={daysData}
                      selectedValue={selectedIndustry}
                      onSelect={(value) => setSelectedIndustry(value)}
                      renderItem={renderIndustryItem}
                    />
              </View>

            <TouchableOpacity className="h-12 w-12">
              <Image className="h-12 w-12" source={require("../../../assets/Tasks/add.png")} />
            </TouchableOpacity>
          </View>

          <View className="w-full mt-16">
           <TouchableOpacity
             className="mb-10 flex h-[4rem] items-center justify-center rounded-full p-5 bg-[#37384B]"
           >
             <Text
               className="text-center font-semibold text-white"
               style={{ fontFamily: "LatoBold" }}
             >
               Upload Documents
             </Text>
           </TouchableOpacity>
         </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default ReminderModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  input: {
    zIndex: 100,
    height: 48,
    position: 'relative',
  },
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278',
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
    fontWeight: '300',
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: '300',
    paddingLeft: 0,
  },
});