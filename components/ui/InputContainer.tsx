import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface InputContainerProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  keyboardType?: any;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  children?: React.ReactNode;
  onPress?: () => void;
}

const InputContainer: React.FC<InputContainerProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType = 'default',
  placeholder,
  multiline = false,
  numberOfLines = 1,
  children,
  onPress,
}) => {
  const renderContent = () => {
    if (children) {
      return children;
    }

    if (onPress) {
      return (
        <TouchableOpacity style={styles.touchableContent} onPress={onPress}>
          <Text style={[styles.input, !editable && styles.inputReadOnly]}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TextInput
        style={[styles.input, !editable && styles.inputReadOnly]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.floatingLabel}>{label}</Text>
        <View style={styles.inputContainer}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    marginTop: 16,
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 8,
    backgroundColor: '#0A0D28',
    paddingHorizontal: 4,
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#6B7280',
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  inputReadOnly: {
    color: '#A9A9A9',
  },
  touchableContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
});

export default InputContainer;