import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform,TextInput, ScrollView } from 'react-native';
import Dropdown from '~/components/Dropdown';
import InputContainer from '~/components/InputContainer';

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
  // Validation state
  const [errors, setErrors] = useState<{
    companyName?: string;
    description?: string;
    businessIndustry?: string;
    teamSize?: string;
    categories?: string;
  }>({});

  const categories = [
    'Sales',
    'Marketing',
    'HR/Admin',
    'General',
    'Operations',
    'Automation',
    'Admin',
    'UI/UX',
  ];

  const businessOptions = [
    'Retail/E-Commerce',
    'Technology',
    'Service Provider',
    'Healthcare',
    'Logistics',
    'Financial Consultants',
    'Trading',
    'Education',
    'Manufacturing',
    'Real Estate',
    'Other',
  ];

  const teamSizeOptions = ['1-10', '11-20', '21-30', '31-50', '51+'];

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required.';
    if (businessIndustry === 'Business Industry')
      newErrors.businessIndustry = 'Select a Business Industry.';
    if (teamSize === 'Team Size') newErrors.teamSize = 'Select a Team Size.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (selectedCategories.length === 0) newErrors.categories = 'Select at least one category.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Form submission logic
      console.log({
        companyName: formData.companyName,
        businessIndustry,
        teamSize,
        description: formData.description,
        selectedCategories,
      });
      alert('Workspace created successfully!');
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  return (
    <View className="items-center pb-4">
      <Text className="text-center text-2xl font-semibold text-white">Create Your Workspace</Text>
      <Text className="my-2 text-center font-light text-white">
        Let's get started by filling out the form below.
      </Text>

      <InputContainer
        label="Company Name"
        placeholder="Company Name"
        value={formData?.companyName}
        onChangeText={(text) => handleChange('companyName', text)}
        passwordError={''}
      />
      {errors.companyName && (
        <Text className=" mt-2 text-sm text-[#FF6F61]">{errors.companyName}</Text>
      )}

      <View className="flex-1 items-center justify-center bg-[#05071E]">
        <Dropdown
          label="Business Industry"
          options={businessOptions}
          onSelect={(value) => setBusinessIndustry(value)}
        />
      </View>

      <Dropdown
        label="Select Team Size"
        options={teamSizeOptions}
        onSelect={(value) => setTeamSize(value)}
      />
      <View
        style={[
          styles.input,
          { height: 100, justifyContent: 'flex-start', alignItems: 'flex-start' },
        ]}>
        <TextInput
          multiline
          style={[styles.inputSome, { textAlignVertical: 'top', width: '100%',backgroundColor:'05071E' }]}
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          placeholder="Description"
          placeholderTextColor="#787CA5"
        />
      </View>

      <Text className="mb-2 px-8 pt-2 text-lg font-semibold text-white">
        Select the categories that are relevant to your business
      </Text>

      <View className="flex-row flex-wrap justify-center gap-2 ">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            className={`mb-2 rounded-full ${
              selectedCategories.includes(category) ? 'bg-purple-600' : 'bg-gray-700'
            } ${Platform.OS === 'ios' ? 'px-4 py-2.5' : 'px-3.5 py-2'}`}
            onPress={() => toggleCategory(category)}>
            <Text className="text-sm font-medium text-white" numberOfLines={1}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {errors.categories && (
        <Text className="mt-2 text-sm text-[#FF6F61]">{errors.categories}</Text>
      )}

      <View className="mb-4 mt-2 flex w-[90%] items-center">
        <Text className="text-[12px]  font-light text-white">
          Don't worry you can add more later in the Settings panel
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 20,
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
    color:'#fff',
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
export default WorkSpaceScreen;
