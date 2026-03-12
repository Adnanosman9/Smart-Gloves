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

    const s1 = Tts.addEventListener('tts-start',  () => setSpeaking(true));
    const s2 = Tts.addEventListener('tts-finish', () => setSpeaking(false));
    const s3 = Tts.addEventListener('tts-cancel', () => setSpeaking(false));
    return () => { s1.remove(); s2.remove(); s3.remove(); };
  }, []);

  const speak = useCallback((text, interrupt = true) => {
    if (!ready) return;
    if (interrupt) Tts.stop();
    Tts.speak(text);
  }, [ready]);

  const stop = useCallback(() => { Tts.stop(); setSpeaking(false); }, []);

  return { speak, stop, speaking, ready };
}
