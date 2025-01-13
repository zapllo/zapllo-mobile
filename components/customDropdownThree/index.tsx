import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CustomDropdownProps {
  data: Array<{ label: string; value: any }>;
  selectedValue: any;
  onSelect: (value: any) => void;
  renderItem: (item: any) => JSX.Element;
}

const CustomDropdownComponentThree: React.FC<CustomDropdownProps> = ({
  data,
  selectedValue,
  onSelect,
  renderItem,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Set the default value to the first item in the data list if no value is selected
  const defaultValue = selectedValue || (data.length > 0 ? data[0].value : null);

  const handleSelect = (value: any) => {
    Haptics.selectionAsync(); // Trigger haptic feedback
    onSelect(value);
    setIsDropdownOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Text style={styles.selectedTextStyle}>
          {defaultValue ? data.find(item => item.value === defaultValue)?.label : 'Select...'}
        </Text>
        <AntDesign
          name={isDropdownOpen ? 'caretup' : 'caretdown'}
          size={12}
          color="#787CA5"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>
      {isDropdownOpen && (
        <View style={styles.dropdownMenu}>
          {data.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => handleSelect(item.value)}
              style={[
                styles.dropdownItem,
                selectedValue === item.value && styles.selectedItem, // Apply selected style to item
              ]}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedValue === item.value && styles.selectedItemText, // Change text color if selected
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownIcon: {
    alignSelf: 'center',
    marginLeft: 10,
  },
  dropdown: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 22,
    paddingHorizontal: 10,
    backgroundColor: '#05071E',
  },
  selectedTextStyle: {
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    color: '#787CA5',
    fontSize: 13,
  },
  selectedItem: {
    backgroundColor: '#FFFFFF', // Change background color to white when selected
    
  },
  selectedItemText: {
    color: '#000000', // Change text color to black when selected
  },
});

export default CustomDropdownComponentThree;