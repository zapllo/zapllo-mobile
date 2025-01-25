// ReminderModal.tsx
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Keyboard,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-native-modal';
import CustomDropdownComponentThree from '~/components/customDropdownThree';
import { KeyboardAvoidingView } from 'react-native';

const daysData = [
  { label: 'Days', value: 'days' },
  { label: 'Hours', value: 'hours' },
  { label: 'Minutes', value: 'minutes' },
];

const notificationTypes = [
  { label: 'Email', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
];

interface ReminderModalProps {
  isReminderModalVisible: boolean;
  setReminderModalVisible: any;
  setAddedReminders: any;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isReminderModalVisible,
  setReminderModalVisible,
  setAddedReminders,
}) => {
  const [mail, setMail] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [number, setNumber] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
      });
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });
  
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

  const [reminders, setReminders] = useState([
    { notificationType: 'email', type: 'days', value: 1, sent: false },
  ]);

  const addReminder = () => {
    setReminders([
      ...reminders,
      { notificationType: 'email', type: 'days', value: 1, sent: false },
    ]);
  };

  const deleteReminder = (index: number) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  const updateReminder = (index: number, key: string, value: any) => {
    const updatedReminders = [...reminders];
    updatedReminders[index][key] = value;
    setReminders(updatedReminders);
  };

  const uploadDocuments = () => {
    console.log('Reminders Data:', reminders);
    setAddedReminders(reminders);
    Alert.alert("Reminder Added!")
    setReminderModalVisible(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      Animated.timing(animatedHeight, {
        toValue: event.endCoordinates.height,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setKeyboardHeight(event.endCoordinates.height);
    });
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
        style={[styles.itemStyle, isSelected && styles.selectedDropdownItemStyle]}
        onPress={() => setSelectedIndustry(item.value)}>
        <Text style={[styles.itemTextStyle, isSelected && styles.selectedTextStyle]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={isReminderModalVisible}
      onBackdropPress={() => setReminderModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View style={[styles.modalContent]}>
        <View className="mb-7 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'Lato-Bold' }}>
            Add Task Reminders
          </Text>
          <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
            <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
          </TouchableOpacity>
        </View>

        <View className=" w-full items-center gap-5">
          {reminders.map((reminder, index) => (
            <View className="flex w-full  flex-row items-center justify-between">
              <View style={styles.input} className="w-[30%]">
                <CustomDropdownComponentThree
                  data={notificationTypes}
                  selectedValue={reminder.notificationType}
                  onSelect={(value) => updateReminder(index, 'notificationType', value)}
          
                />
              </View>

              <TextInput
                value={reminder.value.toString()}
                onChangeText={(text) => updateReminder(index, 'value', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder=""
                className="h-14 w-[20%] rounded-full border border-[#37384B] p-2  text-white text-center"
              />

              <View style={styles.input} className="w-[30%]">
                <CustomDropdownComponentThree
                  data={daysData}
                  selectedValue={reminder.type}
                  onSelect={(value) => updateReminder(index, 'type', value)}
               
                />
              </View>

              <TouchableOpacity
                onPress={index === 0 ? addReminder : () => deleteReminder(index)}
                className="h-12 w-12">
                <Image className="h-12 w-12" 
               source={
                index === 0
                  ? require('../../../assets/Tasks/add.png')
                  : require('../../../assets/Tasks/delete.png')
              } />
              </TouchableOpacity>
            </View>
          ))}
          <View className="mt-16 w-full">
          {!isKeyboardVisible &&
            <TouchableOpacity
              onPress={uploadDocuments}
              className="mb-10 flex h-[4rem] items-center justify-center rounded-full bg-[#37384B] p-5">
              <Text
                className="text-center font-semibold text-white"
                style={{ fontFamily: 'Lato-Bold' }}>
                Add Reminder
              </Text>
            </TouchableOpacity>
            }
          </View>
        </View>
      </Animated.View>
      </KeyboardAvoidingView>
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
