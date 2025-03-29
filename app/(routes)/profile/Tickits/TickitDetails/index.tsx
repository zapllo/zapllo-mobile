import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavbarTwo from '~/components/navbarTwo';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import axios from 'axios';
import { backend_Host } from '~/config';
import moment from 'moment';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';

const TickitDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const { status, message, date, category, subCategory, subject, id } = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(15);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState({});
  const [attachments, setAttachments] = useState<(string | null)[]>([]);
  const [commentData, setCommentData] = useState([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  // console.log("userrr",userData.data.firstName)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      if (Platform.OS === 'ios') {
        setKeyboardOffset(315);
      } else {
        setKeyboardOffset(30);
      }
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    fetchTicket();
  }, [token]);
  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${backend_Host}/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('my ticket>>>>', response.data);
      setTicket(response?.data);
      setCommentData(response?.data?.comments);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('Document Picker Result: ', result);

      if (result.canceled) {
        console.log('Document selection cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        // Update URIs in attachments state for the selected index
        setAttachments((prev) => {
          const updated = [...prev];
          updated[index] = uri;
          console.log('Updated Attachments URIs: ', updated);
          return updated;
        });

        // Update file names in fileNames state for the selected index
        setFileNames((prev) => {
          const updated = [...prev];
          updated[index] = name;
          console.log('Updated File Names: ', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    }
  };

  const handelAddComment = async () => {
    if (!comment) {
      Alert.alert('Validation Error', 'Comment is required!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backend_Host}/tickets/${id}/comments`,
        {
          comment: comment,
          fileUrls: '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newCategoryy = response.data;

      console.log('{{{{{{{{{{{{{{{{object}}}}}}}}}}}}}}}}', newCategoryy);
      Alert.alert('Comment Added');
      fetchTicket();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
      setComment('');
    }
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView
        className="h-full w-full flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ paddingBottom: keyboardOffset }}>
        <NavbarTwo title="Ticket Details" />

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-8 flex w-full flex-col items-center gap-2 pb-20">

            <View className="w-[90%] rounded-3xl border border-[#37384B] bg-[#1E1F2E] p-6 shadow-lg">
                {/* Status Badge with improved styling */}
                <View 
                  style={{
                    backgroundColor: status.toLowerCase() === "pending" ? "#EF4444" : "#815BF5",
                    shadowColor: status.toLowerCase() === "pending" ? "#EF4444" : "#815BF5",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }} 
                  className="mb-4 self-start rounded-full px-4 py-2 flex-row items-center"
                >
                  <MaterialIcons 
                    name={status.toLowerCase() === "pending" ? "pending-actions" : "check-circle"} 
                    size={14} 
                    color="#FFFFFF" 
                    style={{ marginRight: 4 }}
                  />
                  <Text 
                    className="text-xs text-white" 
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    {status.toUpperCase()}
                  </Text>
                </View>

                {/* Ticket Subject with enhanced styling */}
                <View className="flex-row items-center mb-5">
                  <MaterialIcons name="label-important" size={20} color="#815BF5" style={{ marginRight: 8 }} />
                  <Text
                    className="w-full text-xl font-bold text-white"
                    style={{ fontFamily: 'LatoBold', letterSpacing: 0.5 }}
                  >
                    {ticket?.subject}
                  </Text>
                </View>

                {/* Divider */}
                <View className="mb-4 h-[1px] w-full bg-[#37384B] opacity-50" />

                {/* Ticket Details with improved layout */}
                <View className="flex flex-col gap-3">
                  {/* Date */}
                  <View className="flex-row items-center">
                    <View className="flex-row items-center w-[30%]">
                      <MaterialIcons name="event" size={16} color="#787CA5" style={{ marginRight: 6 }} />
                      <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                        Date
                      </Text>
                    </View>
                    <Text className="text-sm text-white flex-1" style={{ fontFamily: 'LatoBold' }}>
                      {moment(ticket?.createdAt).format('ddd, MMMM D - h:mm A')}
                    </Text>
                  </View>

                  {/* Category */}
                  <View className="flex-row items-center">
                    <View className="flex-row items-center w-[30%]">
                      <MaterialIcons name="category" size={16} color="#787CA5" style={{ marginRight: 6 }} />
                      <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                        Category
                      </Text>
                    </View>
                    <View className="bg-[#2A2B3D] px-3 ml-5 py-1 rounded-md">
                      <Text className="text-sm text-white" style={{ fontFamily: 'LatoBold' }}>
                        {ticket?.category}
                      </Text>
                    </View>
                  </View>

                  {/* Subcategory */}
                  <View className="flex-row items-center">
                    <View className="flex-row items-center w-[30%]">
                      <MaterialIcons name="subdirectory-arrow-right" size={16} color="#787CA5" style={{ marginRight: 6 }} />
                      <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                        Subcategory
                      </Text>
                    </View>
                    <View className="bg-[#2A2B3D] ml-9 px-3 py-1 rounded-md">
                      <Text className="text-sm text-white" style={{ fontFamily: 'LatoBold' }}>
                        {ticket?.subcategory}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View className="mt-2">
                    <View className="flex-row items-center mb-1">
                      <MaterialIcons name="description" size={16} color="#787CA5" style={{ marginRight: 6 }} />
                      <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                        Description
                      </Text>
                    </View>
                    <View className="bg-[#2A2B3D] p-3 rounded-lg mt-1">
                      <Text className="text-sm text-white leading-5" style={{ fontFamily: 'LatoBold' }}>
                        {ticket?.description}
                      </Text>
                    </View>
                  </View>


                </View>
              </View>


            <View className="mt-6 w-[90%]">
              <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                {' '}
                Ticket Updates
              </Text>
            </View>
            {commentData?.length &&
              commentData.map((val, index) => {
                const firstName = val?.userId?.firstName || "";
                const lastName = val?.userId?.lastName || "";
                const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

                return (
                  <View
                    key={index}
                    style={{backgroundColor:"rgba(56, 59, 63, 0.3)"}}
                    className="flex w-[90%] flex-col rounded-3xl border mb-1  border-[#37384B] p-6">
                    <View className="flex flex-row items-start gap-2">
                      {/* User Initials Circle */}
                      <View className="h-12 w-12 rounded-full bg-[#815BF5] flex items-center justify-center">
                        <Text className="text-white text-lg font-bold">{initials}</Text>
                      </View>

                      <View className="flex flex-col gap-1">
                        <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                          {firstName} {lastName}
                        </Text>
                        <View className="flex flex-row items-center gap-2">
                          <Image
                            className="h-4 w-4"
                            source={require('../../../../../assets/Tasks/calender.png')}
                          />
                          <Text className="text-xs text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                            {moment(val?.createdAt).format('ddd, MMMM D - h:mm A')}
                          </Text>
                        </View>
                        <Text className="mt-2 text-sm text-white" style={{ fontFamily: 'LatoBold' }}>
                          {val?.content}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

          </View>


        </ScrollView>
        <View
          className="flex flex-row items-center justify-between  px-5"
          style={{
            position: 'absolute',
            bottom: keyboardOffset,
            width: '100%',
            alignItems: 'center',
          }}>
            <TouchableOpacity onPress={handleFileSelect} className="">
              <Image
                className="h-14 w-14"
                source={require('../../../../../assets/Tickit/fileUpload.png')}
              />
            </TouchableOpacity>

            <TextInput
              value={comment}
              onChangeText={(value) => setComment(value)}
              placeholder="Type your comment here"
              placeholderTextColor="#787CA5"
              className="h-16  w-2/3 rounded-full  pl-6 text-sm text-white bg-primary"
              style={{
                fontFamily: 'LatoBold',
                borderColor: isFocused || comment ? '#815BF5' : '#37384B',
                borderWidth: 1,
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <TouchableOpacity disabled={isLoading} onPress={handelAddComment}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image
                  className="h-14 w-14"
                  source={require('../../../../../assets/Tickit/send.png')}
                />
              )}
            </TouchableOpacity>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    color: '#787CA5',
    marginBottom: 10,
  },
});

export default TickitDetails;
