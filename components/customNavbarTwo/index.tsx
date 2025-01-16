import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

interface DropdownItem {
  label: string;
  value: any;
  image?: string;
}

interface CustomDropdownProps {
  data: DropdownItem[];
  selectedValue: any;
  onSelect: (value: any) => void;
  placeholder?: string;
}

const CustomDropdownComponentTwo: React.FC<CustomDropdownProps> = ({
  data,
  selectedValue,
  onSelect,
  placeholder = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (value: any) => {
    setIsOpen(false);
    onSelect(value);
    Haptics.selectionAsync(); // Trigger haptic feedback
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedValue
            ? data.find((item) => item.value === selectedValue)?.label
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
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(item.value)}
              >
                <View style={styles.itemContent}>
                  <View className='bg-white w-8 h-8 p-1 rounded-lg mr-3 '>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  )}
                  </View>
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
                </View>
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 150 }}
          />
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
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 30,
    height: 30,
    marginRight: 10,
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
});

export default CustomDropdownComponentTwo;