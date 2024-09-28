import { AntDesign } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { copyMemeToClipboard } from "../CopyMeme";
import { Meme } from "../types";

export const OpenedMemeDisplay = ({
  meme,
  onClose,
}: {
  meme: Meme;
  onClose: () => void;
}) => {
  // TODO make more sense as a modal?
  return (
    <View style={styles.openedMemeContainer}>
      <TouchableOpacity style={{ marginLeft: 7 }} onPress={() => onClose()}>
        <AntDesign name="leftcircle" size={32} color="black" />
      </TouchableOpacity>
      <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 24 }}>
        {meme.memeName}
      </Text>
      <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
        (long press to copy to cliboard)
      </Text>
      <View style={{ justifyContent: "center" }}>
        <TouchableOpacity onLongPress={() => copyMemeToClipboard(meme)}>
          <Image
            source={{
              // TODO use full size image uri if available; fallback uri's ?
              uri: meme.thumbUri,
            }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  openedMemeContainer: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 60,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
