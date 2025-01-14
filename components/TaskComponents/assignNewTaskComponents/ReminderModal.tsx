import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import CustomDropdownComponentThree from '~/components/customDropdownThree';

const notificationTypes = [
  { label: 'Email', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
];

const daysData = [
  { label: 'Days', value: 'days' },
  { label: 'Hours', value: 'hours' },
  { label: 'Minutes', value: 'minutes' },
];

interface ReminderModalProps {
  isReminderModalVisible: boolean;
  setReminderModalVisible: (visible: boolean) => boolean;
  setAddedReminders:any;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isReminderModalVisible,
  setReminderModalVisible,
  setAddedReminders
}) => {
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
    setAddedReminders(reminders)
    setReminderModalVisible(false)
  };

  return (
    <Modal
      isVisible={isReminderModalVisible}
      onBackdropPress={() => setReminderModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="rounded-t-3xl bg-[#0A0D28] p-5">
          <View className="mb-7 mt-2 flex w-full flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'Lato-Bold' }}>
              Add Task Reminders
            </Text>
            <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
              <Image
                source={require('../../../assets/commonAssets/cross.png')}
                className="h-8 w-8"
              />
            </TouchableOpacity>
          </View>

          <View className="w-full items-center">
            {reminders.map((reminder, index) => (
              <View key={index} className="mb-3 flex w-full flex-row items-center justify-between">
                {/* Notification Type Dropdown */}
                <View style={styles.box}>
                  <CustomDropdownComponentThree
                    data={notificationTypes}
                    selectedValue={reminder.notificationType}
                    onSelect={(value) => updateReminder(index, 'notificationType', value)}
                  />
                </View>

                {/* Number Input */}
                <TextInput
                  value={reminder.value.toString()}
                  onChangeText={(text) => updateReminder(index, 'value', parseInt(text) || 0)}
                  placeholder=""
                  keyboardType="numeric"
                  className="h-14 w-[20%] rounded-full border border-[#37384B] p-2 text-center text-white"
                />

                {/* Unit Dropdown */}
                <View style={styles.box}>
                  <CustomDropdownComponentThree
                    data={daysData}
                    selectedValue={reminder.type}
                    onSelect={(value) => updateReminder(index, 'type', value)}
                  />
                </View>

                {/* Add/Delete Button */}
                <TouchableOpacity
                  onPress={index === 0 ? addReminder : () => deleteReminder(index)}
                  className="h-12 w-12">
                  <Image
                    className="h-12 w-12"
                    source={
                      index === 0
                        ? require('../../../assets/Tasks/add.png')
                        : require('../../../assets/Tasks/delete.png')
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* Upload Documents Button */}
            <View className="mt-16 w-full">
              <TouchableOpacity
                onPress={uploadDocuments}
                className="mb-10 flex h-[4rem] items-center justify-center rounded-full bg-[#37384B] p-5">
                <Text
                  className="text-center font-semibold text-white"
                  style={{ fontFamily: 'Lato-Bold' }}>
                  Add Reminder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReminderModal;

const styles = StyleSheet.create({
  box: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 35,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});
