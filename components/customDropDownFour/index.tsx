import { AntDesign } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';

interface DropdownItem {
  label: string;
  value: any;
  image: string;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  selectedValue: any;
  onSelect: (value: any) => void;
  placeholder?: string;
  // onCreateCategory: (newCategory: string) => void;
}

const CustomDropdownComponentFour: React.FC<CustomDropdownProps> = ({
  data,
  selectedValue,
  onSelect,
  placeholder = '',
  onCreateCategory
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownHeight = useSharedValue(0);

  console.log('okkkkk', data);

  useEffect(() => {
    dropdownHeight.value = withTiming(isDropdownOpen ? 200 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isDropdownOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value,
  }));

  const filteredData = data.filter((item) =>
    item?.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = (item: DropdownItem) => (
    
      <View style={styles.itemContainer}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {item.value === selectedValue && (
          <AntDesign name="checkcircle" size={16} color="#faf9fd" style={styles.selectedIcon} />
        )}
      </View>
     
   
  );

  return (
    <Dropdown
      style={[styles.dropdown, isDropdownOpen ? styles.dropdownOpen : styles.dropdownClosed]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      search
      searchPlaceholder="search"
      searchPlaceholderTextColor="#b9bbe2c3"
      value={selectedValue}
      data={filteredData}
      labelField="label"
      valueField="value"
      placeholder=""
      onChangeText={(text) => setSearchQuery(text)}
      renderItem={renderItem}
      maxHeight={200}
      onChange={(item: DropdownItem) => {
        onSelect(item.value);
        setIsDropdownOpen(false);
        Haptics.selectionAsync(); // Trigger haptic feedback
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
      containerStyle={[
        styles.dropdownMenu,
        isDropdownOpen ? styles.dropdownMenuOpen : styles.dropdownMenuClosed,
      ]}>
      <Animated.View style={[styles.searchContainer, animatedStyle]}>
        <AntDesign name="search1" size={16} color="#787CA5" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={searchQuery ? '' : 'Search'}
          placeholderTextColor="#787CA5"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>
    </Dropdown>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    width: '100%',
    height: 50,
    overflow: 'hidden',
  },
  dropdownOpen: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  dropdownClosed: {
    borderRadius: 17,
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: '300',
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    paddingLeft: 21,
    backgroundColor: 'transparent',
    fontFamily: 'Lato',
    paddingTop: 4,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: '#05071E',
    color: '#FFFFFF',
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    margin: 8,
    zIndex: 4,
    overflow: 'hidden',
  },
  dropdownMenuOpen: {
    borderRadius: 12,
  },
  dropdownMenuClosed: {
    borderRadius: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#05071E',
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#37384B',
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  itemImage: {
    width: 40,
    height: 40,
  },
  itemLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedIcon: {
    marginLeft: 'auto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#05071E',
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
  },
});

export default CustomDropdownComponentFour;
