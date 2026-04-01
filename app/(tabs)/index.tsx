import GetSongs from "@/components/props/songLibrary";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.bg}>
      <GetSongs />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
});
