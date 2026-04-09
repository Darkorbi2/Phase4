import { useSongs } from '@/lib/useSongs';
import React, { createContext, ReactNode, useContext } from 'react';

// Created a player context to share song state and controls across the app.
// Resource: https://legacy.reactjs.org/docs/context.html
type PlayerContextType = ReturnType<typeof useSongs>;

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
	const player = useSongs();
	return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextType {
	const ctx = useContext(PlayerContext);
	if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
	return ctx;
}
