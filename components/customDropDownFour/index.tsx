import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

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

const CustomDropdownWithSearchAndAdd: React.FC<CustomDropdownProps> = ({
  data,
  placeholder = 'Select an option',
  onSelect,
  selectedValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<DropdownItem[]>(data);

  const handleSelect = (value: any) => {
    setIsOpen(false);
    onSelect(value);
  };

  const addItem = () => {
    if (newItem.trim()) {
      const newItemObject = { label: newItem, value: newItem };
      setItems([...items, newItemObject]);
      setNewItem('');
    }
  };

  const filteredData = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedValue
            ? items.find((item) => item.value === selectedValue)?.label
            : placeholder}
        </Text>
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
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 150 }}
          >
            {filteredData.map((item) => (
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
                {selectedValue === item.value && (
                  <AntDesign name="checkcircle" size={16} color="#f8f8fb" style={styles.itemIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.addItemInput}
              placeholder="create category"
              placeholderTextColor="#6a6a6a"
              value={newItem}
              onChangeText={setNewItem}
            />
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Image className='w-5 h-5' source={require("../../assets/Tasks/addIcon.png")}/>
            </TouchableOpacity>
          </View>
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
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  dropdownIcon: {
    alignSelf: 'center',
    marginLeft: 10,
    marginRight: 5,
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderRadius: 15,
    borderColor: '#37384B',
    borderWidth: 1,
    marginTop: 15,
    zIndex: 100,
    overflow: "hidden",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#05071E',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
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
    color: '#FFFFFF',
  },
  itemIcon: {
    marginLeft: 10,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#05071E',
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
    borderRadius: "50%",
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default CustomDropdownWithSearchAndAdd;