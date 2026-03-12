/**
 * TranslateScreen.js
 * ===================
 * The main screen. Handles:
 *   - BLE connection to both gloves
 *   - Feeding sensor data into ML classifier
 *   - Displaying translation + sentence
 *   - TTS playback
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBleGloves }         from '../hooks/useBleGloves';
import { useTTS }               from '../hooks/useTTS';
import { useGestureClassifier } from '../ml/useGestureClassifier';

const { width } = Dimensions.get('window');

// ── Sub-components ─────────────────────────────────────────────────────────────

function GloveDot({ connected, label, rssi }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!connected) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, [connected, pulse]);

  return (
    <View style={styles.gloveDotWrapper}>
      <Animated.View style={[
        styles.gloveDotOuter,
        { transform: [{ scale: pulse }], opacity: connected ? 0.3 : 0 }
      ]} />
      <View style={[styles.gloveDot, { backgroundColor: connected ? '#00e5a0' : '#1a3050' }]} />
      <Text style={[styles.gloveDotLabel, { color: connected ? '#00e5a0' : '#2a4060' }]}>
        {label}
      </Text>
      {rssi && connected && (
        <Text style={styles.rssiText}>{rssi} dBm</Text>
      )}
    </View>
  );
}

function FlexMiniBar({ value, color }) {
  return (
    <View style={styles.flexMiniTrack}>
      <View style={[styles.flexMiniFill, {
        width: `${Math.round(value * 100)}%`,
        backgroundColor: color,
      }]} />
    </View>
  );
}

function HandPanel({ data, side }) {
  const colors = ['#3a7bd5','#5a9bd5','#00c8a8','#f0a040','#e05060'];
  const labels = side === 'L'
    ? ['T','I','M','R','P']
    : ['T','I','M','R','P'];

  return (
    <View style={styles.handPanel}>
      <Text style={styles.handPanelTitle}>{side === 'L' ? 'LEFT' : 'RIGHT'}</Text>
      {(data.flex || [0,0,0,0,0]).map((v, i) => (
        <View key={i} style={styles.flexRow}>
          <Text style={styles.flexLabel}>{labels[i]}</Text>
          <FlexMiniBar value={v} color={colors[i]} />
          <Text style={[styles.flexVal, { color: colors[i] }]}>
            {Math.round(v * 100)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ConfidenceBar({ value }) {
  const color = value > 0.85 ? '#00e5a0' : value > 0.72 ? '#f0c040' : '#ff6b6b';
  return (
    <View style={styles.confRow}>
      <Text style={styles.confLabel}>CONF</Text>
      <View style={styles.confTrack}>
        <View style={[styles.confFill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.confPct, { color }]}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function TranslateScreen() {
  const {
    leftGlove, rightGlove, status, errorMsg,
    connectedCount, scanAndConnect, disconnect,
  } = useBleGloves();

  const { speak, speaking, stop } = useTTS();
  const { classify } = useGestureClassifier();

  const [translation, setTranslation] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [sentence, setSentence] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const translateAnim = useRef(new Animated.Value(0)).current;

  // Run classifier whenever sensors update
  useEffect(() => {
    if (!leftGlove.connected && !rightGlove.connected) return;

    const leftFlex  = leftGlove.flex  || [0,0,0,0,0];
    const rightFlex = rightGlove.flex || [0,0,0,0,0];
    const leftImu   = leftGlove.imu   || { ax:0, ay:0, az:0 };
    const rightImu  = rightGlove.imu  || { ax:0, ay:0, az:0 };

    const result = classify(leftFlex, rightFlex, leftImu, rightImu);
    if (!result) return;

    setTranslation(result);
    setConfidence(result.confidence);
    setSentence(s => [...s, result.label].slice(-12));

    if (autoSpeak) speak(result.label);

    // Bounce animation
    Animated.sequence([
      Animated.timing(translateAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(translateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [leftGlove.lastUpdate, rightGlove.lastUpdate]);

  const handleConnect = useCallback(async () => {
    if (status === 'connected' || status === 'partial') {
      await disconnect();
    } else {
      await scanAndConnect();
    }
  }, [status, scanAndConnect, disconnect]);

  const isConnecting = status === 'scanning';
  const isConnected  = status === 'connected' || status === 'partial';

  const scale = translateAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandText}>SIGNLINK</Text>
            <Text style={styles.titleText}>Translator</Text>
          </View>
          <TouchableOpacity
            style={[styles.connectBtn, isConnected && styles.connectBtnActive]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            <Text style={[styles.connectBtnText, isConnected && { color: '#ff4d6d' }]}>
              {isConnecting ? 'SCANNING...' : isConnected ? 'DISCONNECT' : 'CONNECT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Glove status */}
        <View style={styles.gloveStatusRow}>
          <GloveDot
            connected={leftGlove.connected}
            label="LEFT GLOVE"
            rssi={leftGlove.rssi}
          />
          <View style={styles.gloveStatusCenter}>
            <Text style={styles.gloveStatusCount}>
              {connectedCount}/2
            </Text>
            <Text style={styles.gloveStatusSub}>
              {status === 'scanning' ? 'SCANNING' :
               status === 'connected' ? 'READY' :
               status === 'partial' ? 'PARTIAL' :
               status === 'error' ? 'ERROR' : 'OFFLINE'}
            </Text>
          </View>
          <GloveDot
            connected={rightGlove.connected}
            label="RIGHT GLOVE"
            rssi={rightGlove.rssi}
          />
        </View>

        {/* Error */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        ) : null}

        {/* Translation card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>ML OUTPUT</Text>
            {translation && <ConfidenceBar value={confidence} />}
          </View>

          <Animated.View style={[styles.translationCenter, { transform: [{ scale }] }]}>
            {translation ? (
              <>
                <Text style={[
                  styles.translationText,
                  { fontSize: translation.type === 'letter' ? 88 : 48 }
                ]}>
                  {translation.label}
                </Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{translation.type?.toUpperCase()}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.waitingText}>
                {isConnected ? 'Waiting for gesture...' : 'Connect gloves to start'}
              </Text>
            )}
          </Animated.View>

          {/* Speak button */}
          {translation && (
            <TouchableOpacity
              style={[styles.speakBtn, speaking && styles.speakBtnActive]}
              onPress={() => speaking ? stop() : speak(translation.label)}
            >
              <Text style={styles.speakBtnText}>
                {speaking ? '🔊  SPEAKING...' : '🔈  SPEAK'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Auto-speak toggle */}
        <View style={styles.autoSpeakRow}>
          <Text style={styles.autoSpeakLabel}>AUTO-SPEAK</Text>
          <TouchableOpacity
            style={[styles.toggle, autoSpeak && styles.toggleOn]}
            onPress={() => setAutoSpeak(s => !s)}
          >
            <View style={[styles.toggleThumb, autoSpeak && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>

        {/* Sentence builder */}
        {sentence.length > 0 && (
          <View style={styles.sentenceCard}>
            <View style={styles.sentenceHeader}>
              <Text style={styles.sentenceTitle}>SENTENCE</Text>
              <View style={styles.sentenceActions}>
                <TouchableOpacity onPress={() => speak(sentence.join(' '))}>
                  <Text style={styles.sentenceAction}>▶ PLAY</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSentence([])}>
                  <Text style={[styles.sentenceAction, { color: '#3a3050' }]}>✕ CLEAR</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sentenceWords}>
              {sentence.map((w, i) => (
                <TouchableOpacity key={i} onPress={() => speak(w)}>
                  <View style={styles.wordChip}>
                    <Text style={styles.wordChipText}>{w}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Sensor panels (when connected) */}
        {isConnected && (
          <View style={styles.sensorsRow}>
            <HandPanel data={leftGlove}  side="L" />
            <HandPanel data={rightGlove} side="R" />
          </View>
        )}

        {/* Idle state */}
        {!isConnected && !isConnecting && (
          <View style={styles.idleBox}>
            <Text style={styles.idleEmoji}>🧤</Text>
            <Text style={styles.idleTitle}>Power on both gloves</Text>
            <Text style={styles.idleBody}>
              Make sure SIGNLINK-L and SIGNLINK-R are on, then tap CONNECT above.
              Both devices must be on the same Bluetooth range (~10m).
            </Text>
            <View style={styles.idleSteps}>
              {[
                '① Flash glove_left.ino → left ESP32',
                '② Flash glove_right.ino → right ESP32',
                '③ Power both gloves on',
                '④ Tap CONNECT in the app',
              ].map((s, i) => (
                <Text key={i} style={styles.idleStep}>{s}</Text>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#080c14' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 16 },
  brandText: { fontSize: 10, color: '#3a7bd5', letterSpacing: 4, fontFamily: 'Courier New' },
  titleText: { fontSize: 22, fontWeight: '800', color: '#e2ecff', letterSpacing: -0.5 },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#3a7bd5' },
  connectBtnActive: { backgroundColor: '#140a10', borderWidth: 1, borderColor: '#ff4d6d44' },
  connectBtnText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1.5, fontFamily: 'Courier New' },

  gloveStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gloveDotWrapper: { alignItems: 'center', gap: 4, minWidth: 80 },
  gloveDotOuter: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#00e5a0' },
  gloveDot: { width: 10, height: 10, borderRadius: 5 },
  gloveDotLabel: { fontSize: 8, letterSpacing: 1, fontFamily: 'Courier New' },
  rssiText: { fontSize: 8, color: '#2a4060', fontFamily: 'Courier New' },
  gloveStatusCenter: { alignItems: 'center' },
  gloveStatusCount: { fontSize: 28, fontWeight: '800', color: '#e2ecff' },
  gloveStatusSub: { fontSize: 9, color: '#3a7bd5', letterSpacing: 3, fontFamily: 'Courier New' },

  errorBox: { backgroundColor: '#140a10', borderWidth: 1, borderColor: '#ff4d6d44', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#ff6b6b', fontSize: 12, lineHeight: 18 },

  card: { backgroundColor: '#0d1729', borderWidth: 1, borderColor: '#1e4a8a', borderRadius: 18, padding: 20, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { fontSize: 9, color: '#2a4a7a', letterSpacing: 3, fontFamily: 'Courier New' },

  confRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confLabel: { fontSize: 8, color: '#2a4060', fontFamily: 'Courier New' },
  confTrack: { width: 60, height: 4, backgroundColor: '#0d1117', borderRadius: 2, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 2 },
  confPct: { fontSize: 9, fontFamily: 'Courier New', minWidth: 28 },

  translationCenter: { alignItems: 'center', paddingVertical: 8, minHeight: 120, justifyContent: 'center' },
  translationText: { fontWeight: '800', color: '#ddeeff', textShadowColor: '#3a7bd5aa', textShadowRadius: 20, letterSpacing: 2 },
  typeBadge: { backgroundColor: '#0a1829', borderWidth: 1, borderColor: '#1e3a6a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginTop: 8 },
  typeBadgeText: { fontSize: 9, color: '#3a6aaa', letterSpacing: 3, fontFamily: 'Courier New' },
  waitingText: { color: '#1e3a5a', fontSize: 14, letterSpacing: 1 },

  speakBtn: { marginTop: 12, padding: 10, backgroundColor: '#0c1828', borderWidth: 1, borderColor: '#142035', borderRadius: 10, alignItems: 'center' },
  speakBtnActive: { backgroundColor: '#0a1e38', borderColor: '#2a5a9a' },
  speakBtnText: { color: '#3a6090', fontSize: 11, letterSpacing: 2, fontFamily: 'Courier New' },

  autoSpeakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 10, padding: 14, marginBottom: 12 },
  autoSpeakLabel: { fontSize: 11, color: '#4a6a9a', letterSpacing: 2, fontFamily: 'Courier New' },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#1a2a40', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: '#1e4d8c' },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#2a4060' },
  toggleThumbOn: { backgroundColor: '#3a7bd5', transform: [{ translateX: 20 }] },

  sentenceCard: { backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 12, padding: 14, marginBottom: 12 },
  sentenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sentenceTitle: { fontSize: 9, color: '#2a4a7a', letterSpacing: 3, fontFamily: 'Courier New' },
  sentenceActions: { flexDirection: 'row', gap: 16 },
  sentenceAction: { color: '#3a7bd5', fontSize: 10, letterSpacing: 1, fontFamily: 'Courier New' },
  sentenceWords: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordChip: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#0c1828', borderWidth: 1, borderColor: '#1a3254', borderRadius: 20 },
  wordChipText: { fontSize: 13, color: '#8ab8e8', letterSpacing: 1 },

  sensorsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  handPanel: { flex: 1, backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 12, padding: 12 },
  handPanelTitle: { fontSize: 9, color: '#2a4a7a', letterSpacing: 2, fontFamily: 'Courier New', marginBottom: 10 },
  flexRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  flexLabel: { fontSize: 9, color: '#4a5568', fontFamily: 'Courier New', width: 12 },
  flexMiniTrack: { flex: 1, height: 4, backgroundColor: '#0d1117', borderRadius: 2, overflow: 'hidden' },
  flexMiniFill: { height: '100%', borderRadius: 2 },
  flexVal: { fontSize: 9, fontFamily: 'Courier New', width: 26, textAlign: 'right' },

  idleBox: { backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8 },
  idleEmoji: { fontSize: 48, marginBottom: 16 },
  idleTitle: { fontSize: 16, fontWeight: '700', color: '#c0d8f0', marginBottom: 10 },
  idleBody: { fontSize: 13, color: '#4a6a8a', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  idleSteps: { gap: 8, width: '100%' },
  idleStep: { fontSize: 12, color: '#2a4060', fontFamily: 'Courier New', lineHeight: 20 },
});
