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

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: any) => {
    setIsOpen(false);
    props.onSelect(value);
  };

  return (
    <View style={styles.dropdownContainer}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {props.selectedValue
            ? props.data.find((item) => item.value === props.selectedValue)?.label
            : props.placeholder}
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
            {props.data.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={[styles.dropdownItemText, props.selectedValue === item.value && styles.selectedItemText]}
                >
                  {item.label}
                </Text>
                {props.selectedValue === item.value && (
                  <AntDesign 
                    name="checkcircle" 
                    size={16} 
                    color="#f8f8fb" 
                    style={{ position: 'absolute', right: 10 }} 
                  />
                )}
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
    width: "92%",
  },
  dropdownButton: {
    height: 55,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    borderColor: "#37384B",
    backgroundColor: "#05071E",
    position: 'relative',
  },
  dropdownButtonText: {
    color: "#787CA5",
    fontSize: 14,
    flex: 1,
  },
  dropdownIcon: {
    alignSelf: 'center',
    marginLeft: 10,
    marginRight: 5,
  },
  dropdownMenu: {
    backgroundColor: "#121212",
    borderRadius: 15,
    borderColor: "#37384B",
    borderWidth: 1,
    marginTop: 2,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    // borderBottomWidth: 1,
    borderBottomColor: "#37384B",
    position: 'relative',
    display:"flex",
    alignItems:"center",
    flexDirection:"row",
    justifyContent:"space-between",
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