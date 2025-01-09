import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Image } from 'react-native';
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

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      renderItem={renderItem}
      data={data}
      maxHeight={200}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={selectedValue}
      onChange={(item: any) => onSelect(item.value)}
      onFocus={() => setIsDropdownOpen(true)}
      onBlur={() => setIsDropdownOpen(false)}
      renderRightIcon={() => (
        <AntDesign
          name={isDropdownOpen ? "caretup" : "caretdown"}
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
        alignSelf: 'center',  // Ensures the icon is centered
        marginLeft: 10,
        marginRight: 5,  // Adjust to prevent overflow
      },
    input: {
      borderWidth: 1,
      borderColor: '#37384B',
      padding: 10,
      marginTop: 25,
      borderRadius: 25,
      width: '90%',
      height: 60,
      position: 'relative',
      paddingLeft:14,
    },
  
    inputSome: {
      flex: 1,
      padding: 8,
      color: '#787CA5',
      fontSize: 13,
      fontFamily:"lato-bold"
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    selectedDropdownItemStyle: {
      backgroundColor: '#4e5278', // Background color for selected item
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
      fontWeight: 400,
      fontFamily:"lato"
  
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
  
})

  export default CustomDropdownComponentTwo