import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import Dropdown from '~/components/Dropdown';

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
    <View className="px-5">
      <Text style={styles.title}>Create Your Workspace</Text>
      <Text style={styles.subtitle}>Let’s get started by filling out the form below.</Text>

      <TextInput
        label="Company Name"
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        value={formData?.companyName}
        onChangeText={(text) => handleChange('companyName', text)}
        error={!!errors.companyName}
        theme={{
          roundness: 25,
          colors: {
            primary: '#787CA5',
            background: '#37384B',
          },
        }}
      />
      {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

      <View style={styles.dropdownView}>
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

      <TextInput
        label="Description"
        mode="outlined"
        placeholder="Description"
        placeholderTextColor="#787CA5"
        textColor="#FFFFFF"
        style={[styles.input, { height: 100 }]}
        multiline
        value={formData?.description}
        onChangeText={(text) => handleChange('description', text)}
        error={!!errors.description}
        theme={{
          roundness: 25,
          colors: {
            primary: '#787CA5',
            background: '#37384B',
          },
        }}
      />
      {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

      <Text style={styles.categoryTitle}>
        Select the categories that are relevant to your business
      </Text>

      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={
              selectedCategories.includes(category)
                ? styles.selectedCategoryChip
                : styles.categoryChip
            }
            onPress={() => toggleCategory(category)}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}

      <Text style={styles.footerText}>
        Don’t worry you can add more later in the Settings panel
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PathwayExtreme-Bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#05071E',
  },
  dropdownView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#05071E',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 10,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Align boxes to the start
    gap: 8, // Adds consistent spacing between boxes
  },
  categoryChip: {
    backgroundColor: '#37384B',
    paddingVertical: 4, // Slightly smaller padding for better scaling
    paddingHorizontal: 12, // Adjust to balance box size with text
    borderRadius: 20, // Higher radius for a pill-shaped look
    marginBottom: 8, // Spacing for wrapping
  },
  selectedCategoryChip: {
    backgroundColor: '#815BF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 12,
    marginBottom: 10,
  },
  footerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    marginTop:5,
    marginBottom: 20,
    fontWeight: '400',
  },
});

export default WorkSpaceScreen;
