import { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Colors from "./Colors";

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
  const color = useColorScheme() === "dark" ? Colors.light : Colors.dark;
  const inputRef = useRef<any>(null);
  const clearText = () => {
    setText("");
    // set focus to TextInput
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the TextInput
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, { color }]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={color}
        returnKeyType="done"
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={clearText} style={styles.clearButton}>
          <Text style={[styles.clearButtonText, { color }]}>×</Text>
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
  },
});

export default ClearableTextInput;
