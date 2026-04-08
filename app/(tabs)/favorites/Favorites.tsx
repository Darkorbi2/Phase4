import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { loadFavorites, toggleFavorite } from '@/lib/favorites';

type Song = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	accent: string;
};

export default function Favorites() {
	const [favorites, setFavorites] = useState<Song[]>([]);

	// Per-song animation storage
	const scales = useRef<{ [key: string]: Animated.Value }>({}).current;

	const getScale = (songId: string) => {
		if (!scales[songId]) {
			scales[songId] = new Animated.Value(1);
		}
		return scales[songId];
	};

	const animateHeart = (songId: string) => {
		const scale = getScale(songId);
		Animated.sequence([
			Animated.timing(scale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true })
		]).start();
	};

	// Reload favorites every time screen becomes active
	useFocusEffect(
		useCallback(() => {
			loadFavorites().then(setFavorites);
		}, [])
	);

	const handleToggleFavorite = async (song: Song) => {
		animateHeart(song.id);

		// NEW: toggleFavorite returns updated list
		const updated = await toggleFavorite(song);
		setFavorites(updated);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* HEADER */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='chevron-back' size={18} color='#fff' />
				</TouchableOpacity>

				<Text style={styles.headerTitle}>FAVORITES</Text>

				<TouchableOpacity style={styles.iconButton}>
					<Ionicons name='ellipsis-horizontal' size={18} color='#fff' />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{favorites.length === 0 ? (
					<Text style={styles.emptyText}>No favorite songs yet.</Text>
				) : (
					favorites.map((song) => (
						<View key={song.id} style={styles.songCard}>
							<View style={[styles.accentBar, { backgroundColor: song.accent }]} />

							<View style={{ flex: 1 }}>
								<Text style={styles.songTitle}>{song.title}</Text>
								<Text style={styles.songMeta}>{song.artist}</Text>
							</View>

							<TouchableOpacity onPress={() => handleToggleFavorite(song)}>
								<Animated.View style={{ transform: [{ scale: getScale(song.id) }] }}>
									<Ionicons name='heart' size={20} color='#FF4D4D' style={{ marginRight: 12 }} />
								</Animated.View>
							</TouchableOpacity>

							<Text style={styles.duration}>{song.duration}</Text>
						</View>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#07111B',
		paddingHorizontal: 16,
		paddingTop: 18
	},

	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 18
	},

	iconButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: '#0B1622',
		alignItems: 'center',
		justifyContent: 'center'
	},

	headerTitle: {
		color: '#fff',
		fontWeight: '700',
		letterSpacing: 1,
		fontSize: 12
	},

	emptyText: {
		color: '#7D8A97',
		marginTop: 20,
		textAlign: 'center'
	},

	songCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#0C1824',
		padding: 12,
		borderRadius: 12,
		marginBottom: 10
	},

	accentBar: {
		width: 10,
		height: 40,
		borderRadius: 4,
		marginRight: 12
	},

	songTitle: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 14
	},

	songMeta: {
		color: '#7D8A97',
		fontSize: 12,
		marginTop: 2
	},

	duration: {
		color: '#8FA0B2',
		fontSize: 12
	}
});
