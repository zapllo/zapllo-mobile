import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputContainerProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  passwordError: any;
  rightIcon?: JSX.Element;  // Add this prop for the icon
}

const InputContainer: React.FC<InputContainerProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  passwordError,
  style,
  rightIcon,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.input, 
        passwordError ? { borderColor: '#EE4848' } : { borderColor: '#37384B' },
      ]}>
      <Text style={[styles.baseName, { fontFamily: 'Nunito_400Regular' }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.inputSome, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={''}
          placeholderTextColor="#787CA5"
          {...rest}
        />
        {/* Render the icon inside the input */}
        {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, 
    padding: 10,
    marginTop: 25,
    width: '90%',
    height: 57,
    position: 'relative',
    borderRadius: 35,  // Apply border radius to the outer wrapper
    borderBottomLeftRadius: 35,  // Ensure the bottom corners are rounded
    borderBottomRightRadius: 35, // Ensure the bottom corners are rounded
  },
  baseName: {
    color: '#787CA5',
    position: 'absolute',
    top: -9,
    left: 25,
    backgroundColor: '#05071E',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 13,
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row', // Arrange the text input and icon in a row
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  inputSome: {
    flex: 1,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    borderRadius: 35, // Apply the border radius only to the TextInpu
    paddingBottom: 8, // Ensure no padding hides the bottom border
  },
  iconWrapper: {
    position: 'absolute',
    right: 10, // Position the icon to the right inside the input box
    top: 5,
  },
});

export default InputContainer;
