import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { logPlay } from "@/utils/playHistory";

export type Song = {
  id: string;
  filename: string;
  uri: string;
  duration?: number;
  title?: string;
  artist?: string;
  album?: string;
  artwork?: string | null;
};

export function useSongs() {
  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("checking...");
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Effects
  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Functions
  const addSong = (newSong: Song) => {
    setSongs((prevItems) => [...prevItems, newSong]);
  };

  const removeSong = (removedSong: Song) => {
    setSongs((prevItems) =>
      prevItems.filter((item) => item.id !== removedSong.id),
    );
  };

  const playSong = async (song: Song) => {
    let uri = song.uri;
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
      );

      setSound(newSound);
      setCurrentSong(song);

      await logPlay({
        songId: song.id,
        title: song.title ?? song.filename,
        artist: song.artist ?? 'Unknown Artist',
        duration: song.duration ?? 0,
        playedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const pauseSong = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setCurrentSong(null);
    } catch (error) {
      console.error("Error pausing song:", error);
    }
  };

  const requestPermission = async () => {
    try {
      setError(null);

      const available = await MediaLibrary.isAvailableAsync();
      if (!available) {
        setHasPermission(false);
        setPermissionStatus("unavailable");
        setError("Media library is not available on this device.");
        return;
      }

      const existing = await MediaLibrary.getPermissionsAsync();

      if (existing.status === "granted") {
        setHasPermission(true);
        setPermissionStatus(existing.status);
        return;
      }

      const result =
        Platform.OS === "android"
          ? await MediaLibrary.requestPermissionsAsync(false, ["audio"])
          : await MediaLibrary.requestPermissionsAsync();

      setPermissionStatus(result.status);
      setHasPermission(result.status === "granted");

      if (result.status !== "granted") {
        setError("Permission was denied.");
      }
    } catch (err: any) {
      console.error("Permission request failed:", err);
      setHasPermission(false);
      setPermissionStatus("error");
      setError(err?.message ?? "Unknown error requesting permissions");
    }
  };

  const loadSongs = async () => {
    if (!hasPermission) return;

    try {
      setLoading(true);
      setError(null);

      let allAssets: MediaLibrary.Asset[] = [];
      let after: string | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: ["audio"],
          first: 100,
          after,
          sortBy: [["creationTime", false]],
        });

        allAssets = allAssets.concat(media.assets);
        after = media.endCursor;
        hasNextPage = media.hasNextPage;
      }

      const mappedSongs: Song[] = allAssets.map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        duration: asset.duration,
        title: asset.filename.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        artwork: null,
      }));

      setSongs(mappedSongs);
    } catch (err: any) {
      console.error("Failed to load songs:", err);
      setError(err?.message ?? "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  // Return
  return {
    songs,
    hasPermission,
    loading,
    permissionStatus,
    error,
    currentSong,
    requestPermission,
    loadSongs,
    addSong,
    removeSong,
    playSong,
    pauseSong,
  };
}
