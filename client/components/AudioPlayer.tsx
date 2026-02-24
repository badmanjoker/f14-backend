'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Default Muted for Auto-play policy

    useEffect(() => {
        // Attempt auto-play on mount
        const audio = audioRef.current;
        if (!audio) return;

        const playAudio = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                // Autoplay blocked
                console.log('Autoplay blocked', err);
                setIsPlaying(false);
            }
        };

        // Try playing
        playAudio();

        // Global click listener to unlock audio if blocked
        const unlockAudio = () => {
            if (audio.paused) {
                audio.play().then(() => {
                    setIsPlaying(true);
                    setIsMuted(false); // Unmute on interaction
                }).catch(() => { });
            }
            document.removeEventListener('click', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        return () => document.removeEventListener('click', unlockAudio);
    }, []);

    const toggleMute = () => {
        if (!audioRef.current) return;
        const newState = !isMuted;
        audioRef.current.muted = newState;
        setIsMuted(newState);
        if (!isPlaying && !newState) {
            audioRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src="/song.mp3"
                loop
                muted={isMuted}
                playsInline
            />
            {/* Hidden or Minimal UI - User requested "Audio Visualizer" elsewhere, but this is the Player */}
            {/* We'll add a discreet mute toggle bottom left or integrate with header later. 
                For now, fixing the build is priority. We'll make it fixed bottom left. */}
            <button
                onClick={toggleMute}
                className="fixed bottom-6 left-6 z-50 text-white/50 hover:text-white transition-colors p-2 bg-black/50 rounded-full backdrop-blur-md mix-blend-difference"
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </>
    );
}
