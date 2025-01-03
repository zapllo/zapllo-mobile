import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  LayoutRectangle,
} from "react-native";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

interface DropdownProps {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
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
        y: y + height, // Ensure dropdown is below TextInput
        width: width , // Adjust dropdown width slightly less than TextInput
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
        <TextInput
          label={label}
          mode="outlined"
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#787CA5"
          textColor="#FFFFFF"
          editable={false}
          value={selectedValue}
          theme={{
            roundness: 25,
            colors: {
              primary: "#787CA5",
              background: "#37384B",
            },
          }}
          right={
            <TextInput.Icon
              size={40}
              icon={isDropdownVisible ? "menu-up" : "menu-down"}
              onPress={handleOpenDropdown}
            />
          }
        />
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsDropdownVisible(false)}
        />
        <View
          style={[
            styles.dropdown,
            {
              top: dropdownPosition.y,
              left: dropdownPosition.x +15 ,
              width: dropdownPosition.width -30,
              maxHeight: 250, // Limit dropdown height for scrolling
            },
          ]}
        >
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
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
    width: screenWidth - 32,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#05071E",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#1C1C28",
    borderRadius:8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#37384B",
    zIndex: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#41416E",
  },
  optionText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});
