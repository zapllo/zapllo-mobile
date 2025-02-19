import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';


interface InputContainerProps extends TextInputProps {
  
  value: string;
  onChangeText: (text: string) => void;
  passwordError: any;
  rightIcon?: JSX.Element;
}

const Infocontainer: React.FC<InputContainerProps> = ({
  
  value,
  onChangeText,
  placeholder,
  passwordError,
  style,
  rightIcon,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.input,
     
      ]}
    >
     
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.inputSome, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={''}
          placeholderTextColor="#787CA5"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}

        {/* add a image here  */}
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
    borderRadius: 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    borderColor:"#384387",
    backgroundColor:"#11142a",
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
    flexDirection: 'row',
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
    borderRadius: 35,
    paddingBottom: 8,
    
  },
  iconWrapper: {
    position: 'absolute',
    right: 10,
    top: 5,
  },
});

export default Infocontainer;

