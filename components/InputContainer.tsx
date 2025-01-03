import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';

interface InputContainerProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const InputContainer: React.FC<InputContainerProps> = ({ label, value, onChangeText, placeholder, style, ...rest }) => {
  return (
    <View style={styles.input}>
      <Text style={[styles.baseName, { fontFamily: "Nunito_400Regular" }]}>{label}</Text>
      <TextInput
        style={[styles.inputSome, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#787CA5"
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: '#37384B',
        padding: 10,
        marginTop: 25,
        
        borderRadius: 35,
        width:"90%",
        height:57,
        position:"relative"
      },
      baseName:{
        color:"#787CA5",
        position:"absolute",
        top:-9,
        left:25,
        backgroundColor:"#05071E",
        paddingRight:5,
        paddingLeft:5,
        fontSize:10,
        fontWeight:200
      },
      inputSome:{
        flex:1,
        padding:8,
        color:"#787CA5",
        fontSize:12
      },
});

export default InputContainer;