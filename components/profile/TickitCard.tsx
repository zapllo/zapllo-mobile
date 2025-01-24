import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';

interface TickitCardProps {
  status: any;
  message: any;
  date: any;
  category:any;
  subCategory:any;
  subject:any
}

const TickitCard: React.FC<TickitCardProps> = ({ status, message, date,category,subCategory,subject }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsModalVisible(true);
  };

  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsVisible(false);
    setIsModalVisible(false);
  };

  const cancelDelete = () => {
    Haptics.selectionAsync();
    setIsModalVisible(false);
  };


  const navigateToDetail = () => {
    router.push({
      pathname: '/(routes)/profile/Tickits/TickitDetails' as any,
      params: { status, message, date,category,subCategory,subject },
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={{ width: '90%', borderWidth: 1, borderColor: '#37384B', padding: 20, borderRadius: 30, marginBottom: 20 }}
      onPress={navigateToDetail}
    >
      <View style={{ backgroundColor: '#815BF5', padding: 10, borderRadius: 10, alignItems: 'center', width: 80 }}>
        <Text style={{ color: 'white', fontSize: 12, fontFamily: 'LatoBold' }}>{status}</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: 'white', width: '80%', fontFamily: 'LatoBold' }}>{message}</Text>
        <TouchableOpacity style={{ width: '20%' }} onPress={handleDelete}>
          <Image
            style={{ width: 44, height: 44 }}
            source={require("../../assets/Tickit/delete.png")}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Image style={{ width: 16, height: 16 }} source={require("../../assets/Tickit/calendar.png")} />
        <Text style={{ color: '#787CA5', fontSize: 12, fontFamily: 'LatoBold', marginLeft: 5 }}>
          {date}
        </Text>
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={cancelDelete}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ backgroundColor: '#0A0D28', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30,paddingBottom:55,paddingTop:35 }}>
          <View style={{ alignItems: 'center' }}>
            <Image style={{ width: 80, height: 80, marginBottom: 20 }} source={require("../../assets/Tickit/delIcon.png")} />
            <Text style={{ color: 'white', fontSize: 24 }}>Are you sure you want to</Text>
            <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>delete this ticket?</Text>
            <Text style={{ color: '#787CA5' }}>You're going to delete the "Demo"</Text>
            <Text style={{ color: '#787CA5', marginBottom: 20 }}>ticket. Are you sure?</Text>
            <View  style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={{ backgroundColor: '#37384B', padding: 15, borderRadius: 30, flex: 1, marginRight: 10 }} onPress={cancelDelete}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>No, Keep It.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }} onPress={confirmDelete}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default TickitCard;