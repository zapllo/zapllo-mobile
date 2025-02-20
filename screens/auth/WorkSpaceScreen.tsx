import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import InputContainer from '~/components/InputContainer';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface WorkSpaceScreenProps {
  handleChange: (field: string, value: string) => void;
  formData: {
    companyName: string;
    description: string;
  };
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  teamSize: string;
  setTeamSize: React.Dispatch<React.SetStateAction<string>>;
  businessIndustry: string;
  setBusinessIndustry: React.Dispatch<React.SetStateAction<string>>;
}

const WorkSpaceScreen: React.FC<WorkSpaceScreenProps> = ({
  handleChange,
  formData,
  selectedCategories,
  setSelectedCategories,
  teamSize,
  setTeamSize,
  businessIndustry,
  setBusinessIndustry,
}) => {
  const categories = ['Sales', 'Marketing', 'HR/Admin', 'General', 'Operations', 'Automation', 'Admin', 'UI/UX'];

  const businessOptions = [
    { label: 'Retail/E-Commerce', value: 'Retail/E-Commerce' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Service Provider', value: 'Service Provider' },
    { label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)', value: 'Healthcare(Doctors/Clinics/Physicians/Hospital)' },
    { label: 'Logistics', value: 'Logistics' },
    { label: 'Financial Consultants', value: 'Financial Consultants' },
    { label: 'Trading', value: 'Trading' },
    { label: 'Education', value: 'Education' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Real Estate/Construction/Interior/Architects', value: 'Real Estate/Construction/Interior/Architects' },
    { label: 'Other', value: 'Other' },
  ];

  const teamSizeOptions = [
    { label: '1-10', value: '1-10' },
    { label: '11-20', value: '11-20' },
    { label: '21-30', value: '21-30' },
    { label: '31-50', value: '31-50' },
    { label: '51+', value: '51+' },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth > 450 ? screenWidth / 4 - 20 : screenWidth / 3 - 30;

  return (
    <View className="items-center pb-14">
      <Text className="text-center text-2xl text-white" style={{ fontFamily: 'LatoBold' }}>
        Create Your Workspace
      </Text>
      <Text className="my-2 text-center text-white" style={{ fontFamily: 'Lato-Light' }}>
        Let's get started by filling out the form below.
      </Text>

      <InputContainer
        label="Company Name"
        placeholder="Company Name"
        value={formData?.companyName}
        onChangeText={(text) => handleChange('companyName', text)}
        passwordError={''}
      />

      {/* Business Industry Dropdown */}
      <Dropdown
        data={businessOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Business Industry"
        value={businessIndustry}
        onChange={(item) => setBusinessIndustry(item.value)}
        containerStyle={{
          backgroundColor: '#121212',
          borderRadius: 15,
          borderWidth: 0,
          borderColor: '#37384B',

        }}

        style={{
          borderWidth: 1,
          borderColor: '#37384B',
          // backgroundColor: '#121212',
          paddingHorizontal: 12,
          paddingVertical: 10,
          height: 55,
          borderRadius: 15,
          marginTop: 20,
          width: '90%',
        }}
        placeholderStyle={{
          fontSize: 14,
          color: '#787CA5',
        }}
        selectedTextStyle={{
          fontSize: 14,
          color: 'white',
          marginLeft: 5,
        }}
        itemTextStyle={{
          fontSize: 16,
          color: '#DDE1EB',
        }}
        itemContainerStyle={{
          backgroundColor: '#121212',
        }}
        renderItem={(item) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              // borderRadius:15,

              padding: 12,
              backgroundColor: businessIndustry === item.value ? '#37384B' : 'transparent', // Highlight selected item
            }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{item.label}</Text>
            {businessIndustry === item.value && (
              <Ionicons name="checkmark" size={20} color="#815BF5" />
            )}
          </View>
        )}
      />

      {/* Team Size Dropdown */}
      <Dropdown
        data={teamSizeOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Team Size"
        value={teamSize}
        onChange={(item) => setTeamSize(item.value)}
        // style={styles.dropdown}
        // containerStyle={{
        //   backgroundColor: '#121212', // Ensure the dropdown container is dark
        //   borderRadius: 15, // Optional, for better design
        //   borderWidth: 1,
        //   borderColor: '#37384B',
        // }}
        containerStyle={{
          backgroundColor: '#121212',
          borderRadius: 15,
          borderWidth: 0,
          borderColor: '#37384B',

        }}

        style={{
          borderWidth: 1,
          borderColor: '#37384B',
          // backgroundColor: '#121212',
          paddingHorizontal: 12,
          paddingVertical: 10,
          height: 55,
          borderRadius: 15,
          marginTop: 20,
          width: '90%',
        }}
        placeholderStyle={{
          fontSize: 14,
          color: '#787CA5',
        }}
        selectedTextStyle={{
          fontSize: 14,
          color: 'white',
          marginLeft: 5,
        }}
        itemTextStyle={{
          fontSize: 16,
          color: '#DDE1EB',
        }}
        itemContainerStyle={{
          backgroundColor: '#121212',
        }}
        renderItem={(item) => (
          // containerStyle={styles.dropdownContainer}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              // borderRadius:15,

              padding: 12,
              backgroundColor: teamSize === item.value ? '#37384B' : 'transparent', // Highlight selected item
            }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{item.label}</Text>
            {teamSize === item.value && (
              <Ionicons name="checkmark" size={20} color="#815BF5" />
            )}
          </View>
        )}
      />

      <View
        style={[
          styles.input,
          { height: 100, justifyContent: 'flex-start', alignItems: 'flex-start' },
        ]}>
        <TextInput
          multiline
          style={[
            styles.inputSome,
            { textAlignVertical: 'top', width: '100%', backgroundColor: '05071E' },
          ]}
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="Company Description"
          placeholderTextColor="#787CA5"
        />
      </View>

      <View className="mb-4 mt-2.5 flex items-center px-5">
        <Text className="mb-2 mt-3 pt-2 text-center text-white" style={{ fontFamily: 'Lato' }}>
          Select the categories that are relevant to your business
        </Text>
      </View>

      <View className="flex-row flex-wrap items-center justify-start px-6">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={{
              width: itemWidth,
              marginBottom: 10,
              backgroundColor: selectedCategories.includes(category) ? '#815BF5' : '#37384B',
              paddingVertical: Platform.OS === 'ios' ? 9 : 6,
              borderRadius: 10,
              alignItems: 'center',
              marginLeft: 10,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCategory(category);
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: 'white' }} numberOfLines={1}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = {
  dropdown: {
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 10,
    padding: 12,
    width: '90%',
    marginTop: 20,
    backgroundColor: '#121212',
  },
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 20,
    borderRadius: 15,
    width: '90%',
    height: 57,
    position: 'relative',
  },
  inputSome: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#787CA5',
  },
  selectedText: {
    fontSize: 14,
    color: '#DDE1EB',
  },
  dropdownItemText: {
    fontSize: 14,
    color: 'white',
  },
  dropdownContainer: {
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 5,
  },
};

export default WorkSpaceScreen;
