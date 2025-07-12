import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat,
  Heart,
  MoreHorizontal 
} from 'lucide-react';

const Player = ({ 
  song, 
  isPlaying, 
  setIsPlaying, 
  onNext, 
  onPrevious, 
  canPlayNext, 
  canPlayPrevious 
}) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isLiked, setIsLiked] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    // Initialize YouTube player when song changes
    if (song && window.YT) {
      initializePlayer();
    }
  }, [song]);

  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.innerHTML = '';
    }

    const player = new window.YT.Player(playerRef.current, {
      height: '0',
      width: '0',
      videoId: song.id,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            handleSongEnd();
          }
        }
      }
    });

    // Update current time
    const updateTime = setInterval(() => {
      if (player && player.getCurrentTime) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 1000);

    return () => clearInterval(updateTime);
  };

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      setCurrentTime(0);
      // Replay current song
    } else if (canPlayNext) {
      onNext();
    } else if (repeatMode === 'all') {
      // Go back to first song
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    setCurrentTime(seekTime);
    // Update YouTube player time
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // API call to like/unlike song
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-dark-gray border-t border-spotify-gray px-4 py-3 z-50">
      {/* Hidden YouTube Player */}
      <div ref={playerRef} className="hidden"></div>

      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 w-1/3">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate text-sm">{song.title}</h3>
            <p className="text-spotify-light-gray text-xs truncate">{song.artist}</p>
          </div>
          <button
            onClick={toggleLike}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isLiked ? 'text-spotify-green' : 'text-spotify-light-gray hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-1/3 max-w-2xl">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isShuffled ? 'text-spotify-green' : 'text-spotify-light-gray hover:text-white'
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={onPrevious}
              disabled={!canPlayPrevious}
              className="p-2 text-spotify-light-gray hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="bg-white hover:bg-gray-200 text-black rounded-full p-2 transition-colors duration-200"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              disabled={!canPlayNext}
              className="p-2 text-spotify-light-gray hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors duration-200 ${
                repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-light-gray hover:text-white'
              }`}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && (
                <span className="absolute -mt-1 -mr-1 bg-spotify-green text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-3 w-full">
            <span className="text-xs text-spotify-light-gray w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleSeek}
                className="w-full h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer range-slider"
              />
            </div>
            <span className="text-xs text-spotify-light-gray w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and Actions */}
        <div className="flex items-center justify-end space-x-4 w-1/3">
          <button className="p-2 text-spotify-light-gray hover:text-white transition-colors duration-200">
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-spotify-light-gray hover:text-white transition-colors duration-200"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer range-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;