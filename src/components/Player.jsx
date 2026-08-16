import { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music } from 'lucide-react'

function Player({
  currentTrack,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  onNext,
  onPrev,
  audioRef
}) {
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      setProgress((audio.currentTime / (audio.duration || 1)) * 100)
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        onNext()
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', updateProgress)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', updateProgress)
    }
  }, [isRepeat, onNext, audioRef])

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    audioRef.current.currentTime = newTime
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="glass rounded-3xl p-6 neon-border animate-pulse-neon">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center glow-pink">
          <Music className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">
            {currentTrack?.name || 'آهنگی انتخاب کنید'}
          </h2>
          <p className="text-gray-400 text-sm truncate">
            {currentTrack ? 'در حال پخش' : 'لیست پخش خالی است'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div 
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-neon-pink to-neon-blue rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className={`p-2 rounded-full transition-all ${
            isShuffle 
              ? 'bg-neon-pink/20 text-neon-pink glow-pink' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>
        
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue hover:scale-110 transition-all glow-pink"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>
        
        <button
          onClick={onNext}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
        >
          <SkipForward className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setIsRepeat(!isRepeat)}
          className={`p-2 rounded-full transition-all ${
            isRepeat 
              ? 'bg-neon-blue/20 text-neon-blue glow-blue' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-2"
        />
      </div>
    </div>
  )
}

export default Player
