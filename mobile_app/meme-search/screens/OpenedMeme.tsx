import { AntDesign } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";
import { copyMemeToClipboard } from "../CopyMeme";
import { Meme } from "../types";
import { useState } from "react";
import { highQualityImageUri } from "../MemeUtils";

export const OpenedMemeDisplay = ({
  meme,
  onClose,
}: {
  meme: Meme;
  onClose: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  // TODO make more sense as a modal?
  return (
    <SafeAreaView style={styles.openedMemeContainer}>
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
            onError={() => setImageError(true)}
            source={{
              // use full size image uri if available
              uri: imageError ? meme.thumbUri : highQualityImageUri(meme),
            }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  openedMemeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
