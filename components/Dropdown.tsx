import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  LayoutRectangle,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import InputContainer from '~/components/InputContainer';  // Assuming InputContainer is in components folder

const screenWidth = Dimensions.get('window').width;

interface DropdownProps {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const inputRef = useRef<View>(null);

  const handleOpenDropdown = () => {
    inputRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({
        x,
        y: y + height, // Ensure dropdown is below InputContainer
        width: width, // Adjust dropdown width slightly less than InputContainer
        height,
      });
      setIsDropdownVisible(true);
    });
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsDropdownVisible(false);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <View ref={inputRef} style={styles.inputWrapper}>
        {/* Pass the icon as the rightIcon prop */}
        <InputContainer
          label={label}
          placeholder={label}
          value={selectedValue}
          onChangeText={(text) => setSelectedValue(text)}
          passwordError={null} // Adjust this according to your error handling logic
          style={[styles.input, { borderColor: isDropdownVisible ? '#815BF5' : '#37384B' }]}  // Set border color dynamically
          editable={false}
          rightIcon={
            <TouchableOpacity onPress={handleOpenDropdown}>
              <MaterialCommunityIcons
                name={isDropdownVisible ? 'menu-up' : 'menu-down'}
                size={28}
                color="#787CA5"
              />
            </TouchableOpacity>
          }
        />
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity style={styles.overlay} onPress={() => setIsDropdownVisible(false)} />
        <View
          style={[
            styles.dropdown,
            {
              top: dropdownPosition.y,
              left: dropdownPosition.x + 7,
              width: dropdownPosition.width - 20,
              maxHeight: 250,
            },
          ]}
        >
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedValue === item ? '#fff' : '#787CA5' },
                  ]}
                >
                  {item}
                </Text>
                {selectedValue === item && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </Modal>
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    alignSelf: 'center',
  },
  inputWrapper: {
    alignSelf:'center'
  },
  input: {
    backgroundColor: '#05071E',
    position: 'relative',
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#05071E',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#37384B',
    zIndex: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#37384B',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
});
