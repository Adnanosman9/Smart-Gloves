import { useState, useEffect, useCallback } from 'react';
import Tts from 'react-native-tts';

export function useTTS() {
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
      setReady(true);
    });

    Tts.addEventListener('tts-start', () => setSpeaking(true));
    Tts.addEventListener('tts-finish', () => setSpeaking(false));
    Tts.addEventListener('tts-cancel', () => setSpeaking(false));
  }, []);

  const speak = useCallback((text) => {
    if (!ready) return;
    Tts.stop();
    Tts.speak(text);
  }, [ready]);

  const stop = useCallback(() => { Tts.stop(); setSpeaking(false); }, []);

  return { speak, stop, speaking, ready };
}
