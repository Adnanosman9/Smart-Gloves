/**
 * useTTS.js
 * ==========
 * Text-to-speech wrapper using react-native-tts.
 * Handles initialization, speaking, and queuing.
 */

import { useState, useEffect, useCallback } from 'react';
import Tts from 'react-native-tts';

export function useTTS() {
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    Tts.getInitStatus()
      .then(() => {
        Tts.setDefaultRate(0.5);
        Tts.setDefaultPitch(1.0);
        setReady(true);
      })
      .catch(err => {
        if (err.code === 'no_engine') {
          Tts.requestInstallEngine();
        }
      });

    const startSub = Tts.addEventListener('tts-start',  () => setSpeaking(true));
    const finishSub = Tts.addEventListener('tts-finish', () => setSpeaking(false));
    const cancelSub = Tts.addEventListener('tts-cancel', () => setSpeaking(false));

    return () => {
      startSub.remove();
      finishSub.remove();
      cancelSub.remove();
    };
  }, []);

  const speak = useCallback((text, interrupt = true) => {
    if (!ready) return;
    if (interrupt) Tts.stop();
    Tts.speak(text);
  }, [ready]);

  const stop = useCallback(() => {
    Tts.stop();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, ready };
}
