import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { TextInput, Menu, Button } from "react-native-paper";
import Dropdown from "../components/Dropdown";

const WorkSpaceScreen = ({
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
  const [errors, setErrors] = useState({});

  const categories = [
    "Sales",
    "Marketing",
    "HR/Admin",
    "General",
    "Operations",
    "Automation",
    "Admin",
    "UI/UX",
  ];

  const businessOptions = [
    "Retail/E-Commerce",
    "Technology",
    "Service Provider",
    "Healthcare",
    "Logistics",
    "Financial Consultants",
    "Trading",
    "Education",
    "Manufacturing",
    "Real Estate",
    "Other",
  ];

  const teamSizeOptions = ["1-10", "11-20", "21-30", "31-50", "51+"];

  const validateForm = () => {
    const newErrors = {};
    if (!companyName.trim())
      newErrors.companyName = "Company Name is required.";
    if (businessIndustry === "Business Industry")
      newErrors.businessIndustry = "Select a Business Industry.";
    if (teamSize === "Team Size") newErrors.teamSize = "Select a Team Size.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (selectedCategories.length === 0)
      newErrors.categories = "Select at least one category.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Form submission logic
      console.log({
        companyName,
        businessIndustry,
        teamSize,
        description,
        selectedCategories,
      });
      alert("Workspace created successfully!");
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  return (
    <View>
      <Text style={styles.title}>Create Your Workspace</Text>
      <Text style={styles.subtitle}>
        Let’s get started by filling out the form below.
      </Text>

      <TextInput
        label="Company Name"
        mode="outlined"
        style={styles.input}
        value={formData?.companyName}
        onChangeText={(text) => handleChange("companyName", text)}
        error={!!errors.companyName}
        theme={{
          roundness: 25,
          colors: {
            primary: "#787CA5",
            background: "#37384B",
          },
        }}
      />
      {errors.companyName && (
        <Text style={styles.errorText}>{errors.companyName}</Text>
      )}

      <Dropdown
        label="Select Industry"
        options={businessOptions}
        selectedValue={businessIndustry}
        onSelect={setBusinessIndustry}
        error={errors.businessIndustry}
      />

      <Dropdown
        label="Select Team Size"
        options={teamSizeOptions}
        selectedValue={teamSize}
        onSelect={setTeamSize}
        error={errors.teamSize}
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
        onChangeText={(text) => handleChange("description", text)}
        error={!!errors.description}
        theme={{
          roundness: 25,
          colors: {
            primary: "#787CA5",
            background: "#37384B",
          },
        }}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description}</Text>
      )}

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
            onPress={() => toggleCategory(category)}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.categories && (
        <Text style={styles.errorText}>{errors.categories}</Text>
      )}

      <Text style={styles.footerText}>
        Don’t worry you can add more later in the Settings panel
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "PathwayExtreme-Bold",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#05071E",
  },
  categoryTitle: {
    color: "#fff",
    fontSize: 17,
    marginBottom: 10,
    fontWeight: "600",
  },
  categoriesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    marginLeft: 10,
  },
  categoryChip: {
    backgroundColor: "#37384B",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  selectedCategoryChip: {
    backgroundColor: "#815BF5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF6F61",
    fontSize: 12,
    marginBottom: 10,
  },
  footerText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 20,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4E86E4",
    borderRadius: 25,
  },
});

export default WorkSpaceScreen;
