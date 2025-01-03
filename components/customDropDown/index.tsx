import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons"; // Icon library

interface DropdownItem {
  label: string;
  value: any;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  onSelect: (value: any) => void;
  selectedValue?: any;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  data,
  placeholder = "Select an option",
  onSelect,
  selectedValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: any) => {
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <View style={styles.dropdownContainer}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedValue
            ? data.find((item) => item.value === selectedValue)?.label
            : placeholder}
        </Text>
        {/* Dropdown Icon */}
        <AntDesign
          name={isOpen ? "caretup" : "caretdown"}
          size={14}
          color="#787CA5"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {isOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 150 }}
          >
            {data.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === item.value && styles.selectedItemText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    marginVertical: 10,
    width: "90%",
  },
  dropdownButton: {
    height: 55,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 15,
    borderColor: "#37384B",
    backgroundColor: "#05071E",
  },
  dropdownButtonText: {
    color: "#787CA5",
    fontSize: 14,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dropdownMenu: {
    backgroundColor: "#05071E",
    borderRadius: 8,
    borderColor: "#37384B",
    borderWidth: 1,
    marginTop: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#37384B",
  },
  dropdownItemText: {
    color: "#787CA5",
    fontSize: 14,
  },
  selectedItemText: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
