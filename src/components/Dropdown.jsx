import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Menu } from "react-native-paper";

const Dropdown = ({ label, options, selectedValue, onSelect, error }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setMenuVisible(false);
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <TextInput
            label={label}
            mode="outlined"
            style={styles.input}
            placeholder={label}
            placeholderTextColor="#787CA5"
            textColor="#FFFFFF"
            editable={false}
            value={selectedValue === label ? "" : selectedValue}
            theme={{
              roundness: 25,
              colors: {
                primary: "#787CA5",
                background: "#37384B",
              },
            }}
            error={!!error}
            right={<TextInput.Icon icon="menu-down" />}
          />
        </TouchableOpacity>
      }
    >
      {options.map((option, index) => (
        <Menu.Item
          key={index}
          onPress={() => handleSelect(option)}
          title={option}
        />
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 15,
    backgroundColor: "#05071E",
  },
});

export default Dropdown;
