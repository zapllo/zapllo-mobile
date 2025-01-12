import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal";

export default function AllTaskScreen() {
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Show the modal when the component mounts
    setModalVisible(true);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View className="bg-white p-5 rounded-t-lg">
          <Text className="text-lg font-bold text-blue-500">AllTaskScreen</Text>
        </View>
      </Modal>
    </View>
  );
}