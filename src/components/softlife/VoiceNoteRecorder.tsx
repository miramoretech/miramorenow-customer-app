import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, SkipForward } from "lucide-react";

interface Props {
  voiceBlob: Blob | null;
  setVoiceBlob: (b: Blob | null) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const VoiceNoteRecorder = ({ voiceBlob, setVoiceBlob, onContinue, onSkip }: Props) => {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      }, 1000);
    } catch {
      // permission denied or no mic
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playback = () => {
    if (!voiceBlob) return;
    const url = URL.createObjectURL(voiceBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  };

  const stopPlayback = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Mic className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-bold text-foreground font-display">Add a Voice Note</h3>
        <p className="text-xs text-muted-foreground">Record a short message for the recipient 🎙️</p>
      </div>

      {/* Recorder */}
      <div className="flex flex-col items-center gap-3">
        {!voiceBlob ? (
          <>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center press-scale transition-all shadow-lg ${
                recording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground"
              }`}
            >
              {recording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="text-sm font-bold text-muted-foreground">
              {recording ? `${seconds}s` : "Tap to record"}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={playing ? stopPlayback : playback}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-scale"
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <span className="text-sm font-bold text-foreground">Voice note recorded ✅</span>
            </div>
            <button
              onClick={() => { setVoiceBlob(null); setSeconds(0); }}
              className="text-xs text-primary font-bold press-scale"
            >
              Re-record
            </button>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-2xl bg-muted text-muted-foreground font-bold text-sm press-scale flex items-center justify-center gap-1"
        >
          <SkipForward className="w-3.5 h-3.5" /> Skip
        </button>
        <button
          onClick={onContinue}
          disabled={!voiceBlob}
          className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;
