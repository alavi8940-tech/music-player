import { useRef } from 'react'
import { Upload, Music, Trash2, Play } from 'lucide-react'

function Playlist({ playlist, currentTrack, onSelectTrack, onDeleteTrack, onAddTracks }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onAddTracks(e.target.files)
    }
  }

  return (
    <div className="glass rounded-3xl p-6 neon-border h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">لیست پخش</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-blue rounded-full text-white text-sm hover:scale-105 transition-all glow-pink"
        >
          <Upload className="w-4 h-4" />
          <span>افزودن آهنگ</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {playlist.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>آهنگی اضافه نشده</p>
            <p className="text-sm mt-2">فایل‌های صوتی خود را اینجا بکشید</p>
          </div>
        ) : (
          playlist.map((track) => (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                currentTrack?.id === track.id
                  ? 'bg-gradient-to-r from-neon-pink/20 to-neon-blue/20 border border-neon-pink/50'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                currentTrack?.id === track.id
                  ? 'bg-gradient-to-br from-neon-pink to-neon-blue'
                  : 'bg-white/10'
              }`}>
                {currentTrack?.id === track.id ? (
                  <Play className="w-5 h-5 text-white" />
                ) : (
                  <Music className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  currentTrack?.id === track.id ? 'text-white' : 'text-gray-300'
                }`}>
                  {track.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  فایل صوتی
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTrack(track.id)
                }}
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {playlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
          {playlist.length} آهنگ
        </div>
      )}
    </div>
  )
}

export default Playlist
