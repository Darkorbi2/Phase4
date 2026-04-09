import { usePlayer } from '@/lib/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MiniPlayer() {
	const { currentSong, isPlaying, playbackPosition, playbackDuration, pauseSong, resumeSong, playNext, playPrevious } = usePlayer();

	const slideAnim = useRef(new Animated.Value(100)).current;

	useEffect(() => {
		Animated.spring(slideAnim, {
			toValue: currentSong ? 0 : 100,
			useNativeDriver: true,
			friction: 8,
			tension: 60
		}).start();
	}, [currentSong, slideAnim]);

	if (!currentSong) return null;

	const progress = playbackDuration > 0 ? playbackPosition / playbackDuration : 0;

	return (
		<Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
			<View style={styles.inner}>
				<Image
					source={currentSong.artwork ? { uri: currentSong.artwork } : require('@/assets/images/react-logo.png')}
					style={styles.artwork}
				/>

				<View style={styles.info}>
					<Text style={styles.title} numberOfLines={1}>
						{currentSong.title ?? currentSong.filename ?? 'Unknown'}
					</Text>
					<Text style={styles.artist} numberOfLines={1}>
						{currentSong.artist ?? 'Unknown Artist'}
					</Text>
				</View>

				<View style={styles.controls}>
					<TouchableOpacity onPress={playPrevious} hitSlop={8}>
						<Ionicons name='play-skip-back' size={20} color='#fff' />
					</TouchableOpacity>

					<TouchableOpacity onPress={isPlaying ? pauseSong : resumeSong} hitSlop={8} style={styles.pauseBtn}>
						<Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color='#fff' />
					</TouchableOpacity>

					<TouchableOpacity onPress={playNext} hitSlop={8}>
						<Ionicons name='play-skip-forward' size={20} color='#fff' />
					</TouchableOpacity>
				</View>
			</View>

			{/* Progress bar */}
			<View style={styles.progressTrack}>
				<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 100,
		left: 16,
		right: 16,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#1A2530',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 10,
		zIndex: 100
	},
	inner: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 10
	},
	artwork: {
		width: 42,
		height: 42,
		borderRadius: 8
	},
	info: {
		flex: 1
	},
	title: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '700'
	},
	artist: {
		color: '#7D8A97',
		fontSize: 11,
		marginTop: 2
	},
	controls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14
	},
	pauseBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.12)',
		alignItems: 'center',
		justifyContent: 'center'
	},
	progressTrack: {
		height: 3,
		backgroundColor: 'rgba(255,255,255,0.1)'
	},
	progressFill: {
		height: 3,
		backgroundColor: '#76DFFF'
	}
});
