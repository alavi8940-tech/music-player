import { useState, useRef, useEffect } from 'react'
import Player from './components/Player'
import Playlist from './components/Playlist'
import Visualizer from './components/Visualizer'
import Effects from './components/Effects'

function App() {
  const [playlist, setPlaylist] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.crossOrigin = 'anonymous'
    
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const analyserNode = ctx.createAnalyser()
    analyserNode.fftSize = 256
    
    const source = ctx.createMediaElementSource(audioRef.current)
    source.connect(analyserNode)
    analyserNode.connect(ctx.destination)
    
    setAudioContext(ctx)
    setAnalyser(analyserNode)
    
    return () => {
      audioRef.current.pause()
      ctx.close()
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.url
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrack])

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play()
    } else {
      audioRef.current?.pause()
    }
  }, [isPlaying])

  const handleAddTracks = (files) => {
    const newTracks = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      file: file
    }))
    setPlaylist(prev => [...prev, ...newTracks])
    if (!currentTrack && newTracks.length > 0) {
      setCurrentTrack(newTracks[0])
    }
  }

  const handleSelectTrack = (track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const handleDeleteTrack = (trackId) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId))
    if (currentTrack?.id === trackId) {
      const remaining = playlist.filter(t => t.id !== trackId)
      setCurrentTrack(remaining[0] || null)
    }
  }

  const handleNext = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id)
    let nextIndex
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length)
    } else {
      nextIndex = (currentIndex + 1) % playlist.length
    }
    setCurrentTrack(playlist[nextIndex])
  }

  const handlePrev = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id)
    let prevIndex
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length)
    } else {
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    }
    setCurrentTrack(playlist[prevIndex])
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Effects analyser={analyser} isPlaying={isPlaying} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-2">
            Music Player
          </h1>
          <p className="text-gray-400 text-lg">پلیر موزیک نئونی</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Player
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              volume={volume}
              setVolume={setVolume}
              isShuffle={isShuffle}
              setIsShuffle={setIsShuffle}
              isRepeat={isRepeat}
              setIsRepeat={setIsRepeat}
              onNext={handleNext}
              onPrev={handlePrev}
              audioRef={audioRef}
            />
            <Visualizer analyser={analyser} isPlaying={isPlaying} />
          </div>
          
          <div className="lg:col-span-1">
            <Playlist
              playlist={playlist}
              currentTrack={currentTrack}
              onSelectTrack={handleSelectTrack}
              onDeleteTrack={handleDeleteTrack}
              onAddTracks={handleAddTracks}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
