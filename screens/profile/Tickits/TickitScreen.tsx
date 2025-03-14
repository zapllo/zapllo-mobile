import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState,useMemo } from 'react';
import NavbarTwo from '~/components/navbarTwo';
import { ScrollView } from 'react-native';
import GradientButton from '~/components/GradientButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import TickitCard from '~/components/profile/TickitCard';
import Modal from 'react-native-modal';
import CustomDropdownComponentThree from '~/components/customDropdownThree';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import axios from 'axios';
import { backend_Host } from '~/config';
import moment from 'moment';
import InputContainer from '~/components/InputContainer';
import CustomDropdown from '~/components/customDropDown';

const categoryData = [
  { label: 'Report An Error', value: 'Report An Error' },
  { label: 'Provide Feedback', value: 'Provide Feedback' },
  { label: 'Payment/Subscription Issue', value: 'Payment/Subscription Issue' },
  { label: 'Delete My Accunt', value: 'Delete My Accunt' },
];
const subCategoryData = [
  { label: 'Task Delegation', value: 'Task Delegation' },
  { label: 'My Team', value: 'My Team' },
  { label: 'Intranet', value: 'Intranet' },
  { label: 'Leaves', value: 'Leaves' },
  { label: 'Attendance', value: 'Attendance' },
  { label: 'Other', value: 'Other' },
];
export default function TickitScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [searchTickit, setSearchTickit] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([])
  const [category, setCategory] = useState('Report An Error');
  const [subCategory, setSubCategory] = useState('Task Delegation');
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [tickitDescription, setTickitDescription] = useState('');

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${backend_Host}/tickets/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("resssssssssssssss",response.data)
        setTickets(response?.data)
      } catch (err: any) {
        console.error('API Error:', err.response || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
   
  }, [token]);

  const filteredTickets = useMemo(() => {
    const lowerCaseQuery = searchTickit.toLowerCase();
    return tickets.filter(
      (ticket:any) =>
        ticket?.subject.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.description.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.category?.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.subCategory?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchTickit, tickets]);

  const handelAddNewTicket = async () => {
    if (!newTicketMessage) {
      Alert.alert('Validation Error', 'Subject is required!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backend_Host}/tickets`,
        {
          user:userData?.data?._id || userData?.data?._id, 
          subject:newTicketMessage,
          description:tickitDescription,
          category:category,
          subcategory:subCategory
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("??????????",newTicketMessage,tickitDescription)

      const newCategoryy = response.data; 

      console.log("{{{{{{{{{{{{{{{{object}}}}}}}}}}}}}}}}",newCategoryy)
      Alert.alert('New Ticket Added');
      setTickets([...tickets, response?.data]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
      setNewTicketMessage('');
      setTickitDescription('')
    }
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo title="Support Tickets" onBackPress={() => navigation.goBack()} />
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-36">
            <View
              style={[
                styles.input,
                {
                  height: 57,
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  width: '90%',
                  marginBottom: 30,
                  marginTop: 20,
                },
              ]}>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                ]}
                value={searchTickit}
                onChangeText={(value) => setSearchTickit(value)}
                placeholder="Search Tickets"
                placeholderTextColor="#787CA5"
              />
            </View>
            {loading ? (
              <Text style={{ color: '#fff', marginTop: 20 }}>Loading tickets...</Text>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket:any, index) => (
                <TickitCard
                  key={index}
                  status={ticket?.status}
                  message={ticket?.subject}
                  date={moment(ticket?.createdAt).format('ddd, MMMM D - h:mm A')}
                  category={ticket?.category}
                  subCategory={ticket?.subcategory}
                  subject={ticket?.subject}
                  id={ticket?._id}
                />
              ))
            ) : (
              <Text style={{ color: '#787CA5', marginTop: 20 }}>No tickets found.</Text>
            )}
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 85, width: '100%', alignItems: 'center' }}>
          <GradientButton
            title="Raise a Ticket"
            imageSource={require('../../../assets/Tasks/addIcon.png')}
            onPress={() => setModalVisible(true)}
            
          />
         <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <ScrollView
                className='rounded-t-3xl'
                style={{ width: '100%', height: '70%', backgroundColor: '#0A0D28', padding: 20, }}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}>
                    Raise a Ticket
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Image
                      source={require('../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-col  items-center">
                  <CustomDropdown
                    data={categoryData}
                    selectedValue={category}
                    onSelect={(value) => setCategory(value)}
                  />

                  <CustomDropdown
                    data={subCategoryData}
                    selectedValue={subCategory}
                    onSelect={(value) => setSubCategory(value)}
                  />
                                    <InputContainer
                    placeholder="Subject"
                    value={newTicketMessage}
                    onChangeText={(value) => setNewTicketMessage(value)}
                    passwordError={''}
                    keyboardType="default"
                    label='Subject'
                    />
              

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

                <TouchableOpacity
                  className="my-10 w-[90%] mb-5 items-center rounded-full bg-[#815BF5] p-4"
                  onPress={handelAddNewTicket}>
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
                </View>



              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
        </View>


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
    borderRadius: 20,
    width: '90%',
    height: 57,
    position: 'relative',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
