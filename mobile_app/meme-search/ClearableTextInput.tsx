import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ClearableTextInputProps {
  text: string;
  setText: (text: string) => void;
  placeholder?: string;
}

const ClearableTextInput: React.FC<ClearableTextInputProps> = ({
  text,
  setText,
  placeholder,
}: ClearableTextInputProps) => {
  const clearText = () => {
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        returnKeyType="done"
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={clearText} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 55,
    marginHorizontal: 15,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    fontSize: 28,
    height: 40,
    color: "black", // text color
    borderColor: "blue",
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingRight: 30, // Add padding to the right to make space for the clear button
  },
  clearButton: {
    position: "absolute",
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  clearButtonText: {
    fontSize: 28,
    color: "#888",
  },
});

export default ClearableTextInput;
