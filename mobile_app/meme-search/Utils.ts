import Toast from "react-native-toast-message";

export function showMsg(type: "success" | "error", msg: string) {
  Toast.show({
    type,
    text1: msg,
    topOffset: 80,
    text1Style: {
      fontSize: 16,
    },
  });
}
