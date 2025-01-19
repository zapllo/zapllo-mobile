import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Country {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
}

interface CountryCodePickerProps {
  data: Country[];
  onSelect: (dialCode: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({ data, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.dial_code.includes(query)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const renderItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onSelect(item.dial_code)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.dialCode}>{item.dial_code}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search country"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#05071E',
    borderRadius: 20,
    padding: 10,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 29,
    backgroundColor: '#05071E',
    color: '#787CA5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#4e5278',
    borderBottomWidth: 1,
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  dialCode: {
    fontSize: 14,
    color: '#787CA5',
    marginRight: 10,
  },
  name: {
    fontSize: 14,
    color: '#787CA5',
  },
});

export default CountryCodePicker;