import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { router, useRouter, useLocalSearchParams } from 'expo-router';
import { GradientText } from '~/components/GradientText';
import InputContainer from '~/components/InputContainer';
import axios from 'axios';

export default function SignUpTwoScreen() {
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [isTeamSizeDropdownOpen, setIsTeamSizeDropdownOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null); // Selected value for Industry dropdown
  const [selectedTeamSize, setSelectedTeamSize] = useState(null); // Selected value for Team Size dropdown
  const router = useRouter();
  const { data } = useLocalSearchParams(); // Use useLocalSearchParams instead
  const initialData = data ? JSON.parse(data as any) : {}; // Parse received data

  const [userData, setUserData] = useState({
    ...initialData,
  });

  const categoriesData = [
    { id: 1, item: 'Sales', selected: false },
    { id: 2, item: 'Marketing', selected: false },
    { id: 3, item: 'HR/Admin', selected: false },
    { id: 4, item: 'General', selected: false },
    { id: 5, item: 'Operations', selected: false },
    { id: 6, item: 'Automation', selected: false },
    { id: 7, item: 'Admin', selected: false },
    { id: 8, item: 'UI/UX', selected: false },
  ];
  const [selectedItem, setSelectedItem] = useState(categoriesData);

  const onSelect = (item: any) => {
    const newItem = selectedItem.map((val) => {
      if (val.id === item.id) {
        return { ...val, selected: !val.selected }; // Toggle selection
      } else {
        return val;
      }
    });
    setSelectedItem(newItem);
  };

  const industryData = [
    { label: 'Retail/E-Commerce', value: 'Retail/E-Commerce' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Service Provider', value: 'Service Provider' },
    {
      label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)',
      value: 'Healthcare(Doctors/Clinics/Physicians/Hospital)',
    },
    { label: 'Logistics', value: 'Logistics' },
    { label: 'Financial Consultants', value: 'Financial Consultants' },
    { label: 'Trading', value: 'Trading' },
    { label: 'Education', value: 'Education' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    {
      label: 'Real Estate/Construction/Interior/Architects',
      value: 'Real Estate/Construction/Interior/Architects',
    },
    { label: 'Others', value: 'Others' },
  ];

  const teamsData = [
    { label: '1-10', value: '1-10' },
    { label: '11-20', value: '11-20' },
    { label: '21-30', value: '21-30' },
    { label: '31-50', value: '31-50' },
    { label: '51+', value: '51+' },
  ];

  const isFormValid =
    companyName.trim() !== '' && selectedIndustry !== null && selectedTeamSize !== null;

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

  const renderTeamSizeItem = (item: any) => {
    const isSelected = item.value === selectedTeamSize;

    return (
      <TouchableOpacity
        style={[
          styles.itemStyle,
          isSelected && styles.selectedDropdownItemStyle, // Apply selected item style
        ]}
        onPress={() => setSelectedTeamSize(item.value)} // Update selected item
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

  const handleSignUp = async () => {
    const categories = selectedItem
      .filter((item) => item.selected) // Only include selected categories
      .map((item) => item.item);

    const payload = {
      ...userData,
      companyName,
      industry: selectedIndustry,
      teamSize: selectedTeamSize,
      description,
      categories,
    };

    console.log('Payload to send:', payload); // Debugging: Check the payload

    await axios
      .post('https://zapllo.com/api/users/signup', payload)
      .then((res) => {
        console.log('Response from server:', res.data);
        alert('Sign-up successful!');
        // router.push("/success"); // Navigate to success page
      })
      .catch((err) => {
        console.error('Error during sign-up:', err);
        alert('An error occurred. Please try again.');
      });
  };

  return (
    <SafeAreaView className="h-full w-full items-center  bg-[#05071E] ">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className=" h-full w-full items-center">
            {/* starting banner */}
            <View className="mb-9 mt-[4.6rem] w-full flex-row items-center justify-center">
              <Image
                className="h-9 w-12"
                source={require('~/assets/sign-in/teamsLogo.png')}
                resizeMode="contain"
              />
              <Text className="ml-2 mt-2 text-xl font-semibold text-white">Zapllo Teams</Text>
            </View>

            {/* middle banner */}
            <View className="mb-2 flex w-full items-center justify-center gap-6">
              <Text className="text-2xl font-semibold text-white">Create Your Workspace</Text>
              <Text className="font-light text-white ">
                Let's get started by filling out the form below.
              </Text>
            </View>

            {/* Company Name */}
            <InputContainer
              label="Company Name"
              value={companyName}
              onChangeText={(value) => setCompanyName(value)}
              placeholder="Company Name"
              passwordError={''}
            />

            {/* drop down Business Industry names */}
            {/* drop down Business Industry names */}
            <View style={styles.input}>
              <Text style={[styles.baseName, { fontFamily: 'Nunito_400Regular' }]}>
                Business Industry
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                renderItem={renderIndustryItem} // Render Industry dropdown items
                data={industryData}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Select an Industry"
                value={selectedIndustry} // Bind selected value
                onChange={(item: any) => setSelectedIndustry(item.value)} // Update selected value
                onFocus={() => setIsIndustryDropdownOpen(true)} // Set dropdown as open
                onBlur={() => setIsIndustryDropdownOpen(false)} // Set dropdown as closed
                iconStyle={{
                  transform: [{ rotate: isIndustryDropdownOpen ? '180deg' : '0deg' }],
                }} // Rotate the icon dynamically
                containerStyle={styles.dropdownMenu}
              />
            </View>

            {/* drop down team size names */}
            <View style={styles.input}>
              <Text style={[styles.baseName, { fontFamily: 'Nunito_400Regular' }]}>Team Size</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                renderItem={renderTeamSizeItem} // Render Team Size dropdown items
                data={teamsData}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Select a Team Size"
                value={selectedTeamSize} // Bind selected value
                onChange={(item: any) => setSelectedTeamSize(item.value)} // Update selected value
                onFocus={() => setIsTeamSizeDropdownOpen(true)} // Set dropdown as open
                onBlur={() => setIsTeamSizeDropdownOpen(false)} // Set dropdown as closed
                iconStyle={{
                  transform: [{ rotate: isTeamSizeDropdownOpen ? '180deg' : '0deg' }],
                }} // Rotate the icon dynamically
                containerStyle={styles.dropdownMenu}
              />
            </View>
            {/* Description */}
            <View
              style={[
                styles.input,
                { height: 100, justifyContent: 'flex-start', alignItems: 'flex-start' },
              ]}>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                ]}
                value={description}
                onChangeText={(value) => setDescription(value)}
                placeholder="Description"
                placeholderTextColor="#787CA5"></TextInput>
            </View>

            <View className="mb-6 mt-6 flex w-[90%] items-start gap-3">
              <Text className="mt-1 font-light text-white">
                Select the categories that are relevant to your business
              </Text>
            </View>

            {/* Render buttons without scrolling */}
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: '90%',
                gap: 5,
                alignItems: 'flex-start',
              }}>
              {selectedItem.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    width: 69, // Fixed width in pixels
                    height: 30, // Fixed height in pixels
                    // Spacing between buttons
                    borderRadius: 40, // Rounded corners
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: item.selected ? '#815BF5' : '#37384B',
                    marginRight: 3,
                    marginTop: 3,
                    padding: 3,
                    minWidth: 65,
                    maxWidth: 69,
                  }}
                  onPress={() => onSelect(item)}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-4 mt-4 flex w-[90%]  items-start">
              <Text className="text-[12px]  font-light text-white ">
                Don't worry you can add more later in the Settings panel
              </Text>
            </View>

            {/* button sign up */}
            <TouchableOpacity
              className={`mt-3 flex h-[3.6rem] w-[89%] items-center justify-center rounded-full p-2.5 ${isFormValid ? 'bg-[#815BF5]' : 'bg-[#37384B]'}`}
              onPress={handleSignUp}>
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={'white'} />
              ) : (
                <Text className="text-center text-white ">Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* go to the login page */}
            <View className="mb-10 mt-4 flex-row items-center justify-end ">
              <Text className="mr-1 font-light text-white">Already a </Text>
              <GradientText text="Zapllonian" />
              <Text className="mr-1 text-white">? </Text>
              <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
                <Text className="font-semibold text-white">Log In Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 35,
    width: '90%',
    height: 57,
    position: 'relative',
  },
  baseName: {
    color: '#787CA5',
    position: 'absolute',
    top: -9,
    left: 25,
    backgroundColor: '#05071E',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 10,
    fontWeight: 200,
  },
  inputSome: {
    flex: 1,
    padding: 8,
    color: '#787CA5',
    fontSize: 12,
  },

  dropdown: {
    position: 'absolute',
    width: '100%',
    height: 50,
  },
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },
  selectedItemStyle: {
    backgroundColor: '#4e5278',
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
    paddingLeft: 22,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    marginRight: 5,
    borderColor: 'white',
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
  dropdownMenuTwo: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
});
