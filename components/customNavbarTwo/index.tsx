import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface CustomDropdownProps {
  data: Array<{ label: string; value: any }>;
  selectedValue: any;
  onSelect: (value: any) => void;
  placeholder?: string;
  renderItem: (item: any) => JSX.Element;
}

const CustomDropdownComponentTwo: React.FC<CustomDropdownProps> = ({
  data,
  selectedValue,
  onSelect,
  placeholder = '',
  renderItem,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = data.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      search
      searchPlaceholder="Search..."
      value={selectedValue}
      data={filteredData} // Use the filtered data
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      onChangeText={(text) => setSearchQuery(text)} // Update search query
      renderItem={renderItem}
      maxHeight={200}
      onChange={(item: any) => {
        onSelect(item.value); // Call the onSelect function
        setIsDropdownOpen(false); // Close the dropdown
      }}
      onFocus={() => setIsDropdownOpen(true)}
      onBlur={() => setIsDropdownOpen(false)}
      renderRightIcon={() => (
        <AntDesign
          name={isDropdownOpen ? 'caretup' : 'caretdown'}
          size={14}
          color="#787CA5"
          style={styles.dropdownIcon}
        />
      )}
      containerStyle={styles.dropdownMenu}
    />
  );
};

const styles = StyleSheet.create({
  dropdownIcon: {
    alignSelf: 'center',
    marginLeft: 10,
    marginRight: 5,
  },
  dropdown: {
    position: 'absolute',
    width: '100%',
    height: 50,
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: '300',
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: '300',
    paddingLeft: 22,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderColor: '#37384B',
    borderWidth: 1,
    backgroundColor: '#05071E',
    color: '#FFFFFF',
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
});

export default CustomDropdownComponentTwo;
