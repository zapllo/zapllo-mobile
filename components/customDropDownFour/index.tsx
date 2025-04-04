import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { backend_Host } from '~/config';
import { RootState } from '~/redux/store';

interface DropdownItem {
  label: string;
  value: any;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  placeholder?: string;
  onSelect: (value: any) => void;
  selectedValue?: any;
  setCategoryData: any;
  onCreateCategory: any;
  isLoading: any;
}

const CustomDropdownWithSearchAndAdd: React.FC<CustomDropdownProps> = ({
  data,
  placeholder = 'Select an option',
  onSelect,
  selectedValue,
  onCreateCategory,
  setCategoryData,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<DropdownItem[]>(data);
  const { token, userData } = useSelector((state: RootState) => state.auth);

  const handleSelect = (value: any) => {
    setIsOpen(false);
    onSelect(value);

    console.log('>>>>>>>vall', value);
  };

  const addItem = () => {
    if (newItem.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    const newCategoryItem = {
      label: newItem,
      value: newItem.toLowerCase().replace(/\s+/g, '_'),
    };

    const updatedItems = [newCategoryItem, ...items];
    setItems(updatedItems);
    setCategoryData(updatedItems);
    onCreateCategory(newItem);

    setNewItem('');
  };
  const filteredData = data?.filter((item) =>
    item?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  console.log('Selected Value:', selectedValue);
  console.log('Items:', items);
  console.log(
    'Matching Item:',
    items.find((item) => item.value === selectedValue)
  );

  const selectval = selectedValue
    ? filteredData.find((item) => item.value === selectedValue)?.label || placeholder
    : placeholder;

    console.log("<<<<<object>>>>>",selectval)
    console.log("<<<<<object>>>>>😌",filteredData)

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.dropdownButtonText}>{selectval}</Text>
        <AntDesign
          name={isOpen ? 'caretup' : 'caretdown'}
          size={14}
          color="#787CA5"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          <View style={styles.searchContainer}>
            <AntDesign name="search1" size={16} color="#787CA5" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#787CA5"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(item.value)}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === item.value && styles.selectedItemText,
                  ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <AntDesign name="checkcircle" size={16} color="#f8f8fb" style={styles.itemIcon} />
                )}
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 150 }}
          />
          {userData?.data?.role === 'orgAdmin' || userData?.user?.role === 'orgAdmin' ? (
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="create category"
                placeholderTextColor="#6a6a6a"
                value={newItem}
                onChangeText={setNewItem}
              />
              <TouchableOpacity style={styles.addButton} onPress={addItem} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Image className="h-5 w-5" source={require('../../assets/Tasks/addIcon.png')} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            ''
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    width: '100%',
  },
  dropdownButton: {
    height: 35,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 9,
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  dropdownIcon: {
    alignSelf: 'center',
    marginLeft: 10,
    marginRight: 5,
  },
  dropdownMenu: {
    backgroundColor: '#121212',
    borderRadius: 10,
    borderColor: '#37384B',
    borderWidth: 1,
    marginTop: 15,
    width:'105%',
    alignSelf:'center',
    zIndex: 100,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
    zIndex: 100,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    // borderBottomWidth: 1,
    borderBottomColor: '#37384B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    color: '#787CA5',
    fontSize: 14,
    flex: 1,
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  itemIcon: {
    marginLeft: 10,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#37384B',
  },
  addItemInput: {
    flex: 1,
    height: 40,
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    backgroundColor: '#1b1c1f',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: 'rgb(0 122 90)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: '50%',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default CustomDropdownWithSearchAndAdd;
