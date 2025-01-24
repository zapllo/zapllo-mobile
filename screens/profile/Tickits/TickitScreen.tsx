import { Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { ScrollView } from "react-native";
import GradientButton from "~/components/GradientButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "expo-router";
import TickitCard from "~/components/profile/TickitCard";
import Modal from 'react-native-modal';
import CustomDropdownComponentThree from "~/components/customDropdownThree";


const categoryData = [
  { label: 'Report An Erroy', value: 'Report An Erroy' },
  { label: 'Provide Feedback', value: 'Provide Feedback' },
  { label: 'Payment/Subscription Issue', value: 'Payment/Subscription Issue' },
  { label: 'Delete My Accunt', value: 'Delete My Accunt' },
];
export default function TickitScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchTickit, setSearchTickit] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [tickets, setTickets] = useState([
    { status: "Pending", message: "Updated Items are not reflected in Trigger", date: "Wed, December 25 - 12:13 PM" },
    { status: "Pending", message: "Your ticket is being processed.", date: "2023-10-15" }
  ]);
  const [category,setCategory] = useState("");
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [tickitDescription, setTickitDescription] = useState('');

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  const addNewTicket = () => {
    const newTicket = {
      status: "Pending",
      message: newTicketMessage,
      date: new Date().toLocaleString(),
      category

    };
    setTickets([...tickets, newTicket]);
    setModalVisible(false);
    setNewTicketMessage("");
  };



  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView className="w-full" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo title="Support Tickets" onBackPress={() => navigation.goBack()} />
        <ScrollView className="h-full w-full flex-grow" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-20">
            <View style={[styles.input, { height: 57, justifyContent: 'flex-start', alignItems: 'flex-start', width: "90%", marginBottom: 30, marginTop: 20 }]}>
              <TextInput
                multiline
                style={[styles.inputSome, { textAlignVertical: 'top', paddingTop: 10, width: '100%' }]}
                value={searchTickit}
                onChangeText={(value) => setSearchTickit(value)}
                placeholder="Search Tickits"
                placeholderTextColor="#787CA5"
              />
            </View>

            {tickets.map((ticket, index) => (
              <TickitCard key={index} status={ticket.status} message={ticket.message} date={ticket.date} />
            ))}
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 85, width: '100%', alignItems: 'center' }}>
          <GradientButton title="Raise a Ticket" imageSource={require('../../../assets/Tasks/addIcon.png')} onPress={() => setModalVisible(true)} />
        </View>

        <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
        >

        <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView 
          
          className="mt-52  rounded-t-3xl h-full bg-[#0A0D28] p-5">
              <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
                <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                Raise a Ticket 
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                </TouchableOpacity>
              </View>    

              <View className="gap-6 flex flex-col">
              <CustomDropdownComponentThree
                data={categoryData}
                selectedValue={category}
                onSelect={(value) => setCategory(value)}
                />      

                <CustomDropdownComponentThree
                data={categoryData}
                selectedValue={category}
                onSelect={(value) => setCategory(value)}
                />    

              </View> 


                <View
                style={[
                  styles.input,
                  {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    borderColor: isDescriptionFocused ? '#815BF5' : '#37384B',
                  },
                ]}>
                  <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Subject</Text>
                  <TextInput
                  multiline
                  style={[
                    styles.inputSome,
                    { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                  ]}
                  value={newTicketMessage}
                  onChangeText={(value) => setNewTicketMessage(value)}
                  placeholder=""
                  placeholderTextColor="#787CA5"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                </View>

              {/* desc */}
              <View
                style={[
                  styles.input,
                  {
                    height: 100,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    borderColor: isDescriptionFocused ? '#815BF5' : '#37384B',
                  },
                ]}>
                <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Description</Text>
                <TextInput
                  multiline
                  style={[
                    styles.inputSome,
                    { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                  ]}
                  value={tickitDescription}
                  onChangeText={(value) => setTickitDescription(value)}
                  placeholder=""
                  placeholderTextColor="#787CA5"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </View>

              <TouchableOpacity className="my-10 items-center bg-[#815BF5] p-4 rounded-full" onPress={addNewTicket}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        </Modal>
      </KeyboardAvoidingView>
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
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    paddingHorizontal: 10
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  baseName: {
    color: '#787CA5',
    position: 'absolute',
    top: -9,
    left: 25,
    backgroundColor: '#05071E',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 13,
    fontWeight: 400,
    fontFamily: 'lato',
  },
  inputSome: {
    flex: 1,
    padding: 9,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'lato-Bold',
    
  },
});