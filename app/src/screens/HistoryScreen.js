
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'signlink_history';

export function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then(raw => { if (raw) setHistory(JSON.parse(raw)); });
  }, []);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={[styles.historyBadge, { borderColor: item.type === 'word' ? '#3a7bd5' : '#1e3a6a' }]}>
        <Text style={[styles.historyBadgeText, { fontSize: item.type === 'letter' ? 20 : 13 }]}>
          {item.label}
        </Text>
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyLabel}>{item.label}</Text>
        <Text style={styles.historyMeta}>
          {item.type?.toUpperCase()} · {Math.round((item.confidence || 0) * 100)}% · {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>SIGNLINK</Text>
        <Text style={styles.title}>History</Text>
      </View>
      <View style={styles.historyToolbar}>
        <Text style={styles.historyCount}>{history.length} translations</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearBtn}>CLEAR ALL</Text>
          </TouchableOpacity>
        )}
      </View>
      {history.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>No history yet</Text>
          <Text style={styles.emptyBody}>Translations will appear here as you use the gloves</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </SafeAreaView>
  );
}

export function SettingsScreen() {
  const [settings, setSettings] = useState({
    autoSpeak: true,
    speakRate: 0.5,
    confidenceThreshold: 72,
    windowSize: 6,
    saveHistory: true,
    hapticFeedback: true,
  });

  const update = useCallback((key, val) => {
    setSettings(s => {
      const next = { ...s, [key]: val };
      AsyncStorage.setItem('signlink_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('signlink_settings').then(raw => { if (raw) setSettings(JSON.parse(raw)); });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>SIGNLINK</Text>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <Text style={styles.sectionLabel}>SPEECH</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingName}>Auto-speak translations</Text>
            <Switch
              value={settings.autoSpeak}
              onValueChange={v => update('autoSpeak', v)}
              trackColor={{ false: '#1a2a40', true: '#1e4d8c' }}
              thumbColor={settings.autoSpeak ? '#3a7bd5' : '#2a4060'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingName}>Haptic feedback</Text>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={v => update('hapticFeedback', v)}
              trackColor={{ false: '#1a2a40', true: '#1e4d8c' }}
              thumbColor={settings.hapticFeedback ? '#3a7bd5' : '#2a4060'}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ML CLASSIFIER</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingName}>Confidence threshold</Text>
              <Text style={styles.settingHint}>Min confidence to accept a result</Text>
            </View>
            <Text style={styles.settingValue}>{settings.confidenceThreshold}%</Text>
          </View>
          <View style={styles.sliderRow}>
            {[60,70,72,75,80,85,90].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.sliderChip, settings.confidenceThreshold === v && styles.sliderChipActive]}
                onPress={() => update('confidenceThreshold', v)}
              >
                <Text style={[styles.sliderChipText, settings.confidenceThreshold === v && { color: '#3a7bd5' }]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingName}>Window size</Text>
              <Text style={styles.settingHint}>Frames that must agree before emitting</Text>
            </View>
            <Text style={styles.settingValue}>{settings.windowSize}</Text>
          </View>
          <View style={styles.sliderRow}>
            {[3,4,5,6,8,10].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.sliderChip, settings.windowSize === v && styles.sliderChipActive]}
                onPress={() => update('windowSize', v)}
              >
                <Text style={[styles.sliderChipText, settings.windowSize === v && { color: '#3a7bd5' }]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingName}>Save history</Text>
            <Switch
              value={settings.saveHistory}
              onValueChange={v => update('saveHistory', v)}
              trackColor={{ false: '#1a2a40', true: '#1e4d8c' }}
              thumbColor={settings.saveHistory ? '#3a7bd5' : '#2a4060'}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.settingCard}>
          {[
            ['Hardware', 'ESP32-C6 × 2 + MPU6050'],
            ['Sensors', '10 flex + 2 IMU (6-DOF)'],
            ['ML Model', 'Random Forest, 39 classes'],
            ['Accuracy', '99% (synthetic), ~85–92% real'],
            ['Version', '1.0.0'],
          ].map(([k, v]) => (
            <View key={k}>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>{k}</Text>
                <Text style={styles.settingValue}>{v}</Text>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>CALIBRATION NOTE</Text>
        <View style={[styles.settingCard, { gap: 0 }]}>
          <Text style={styles.calNote}>
            Run calibration.ino on each ESP32 before the main firmware.
            Copy the printed FLEX_MIN[] and FLEX_MAX[] values into
            glove_left.ino and glove_right.ino respectively.
            This maps raw ADC values to 0.0–1.0 for accurate classification.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080c14' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1a2a40' },
  brand: { fontSize: 9, color: '#3a7bd5', letterSpacing: 4, fontFamily: 'Courier New' },
  title: { fontSize: 22, fontWeight: '800', color: '#e2ecff' },

  historyToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  historyCount: { fontSize: 11, color: '#2a4060', fontFamily: 'Courier New', letterSpacing: 1 },
  clearBtn: { fontSize: 10, color: '#ff4d6d', fontFamily: 'Courier New', letterSpacing: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 10, padding: 12 },
  historyBadge: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#0c1829', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  historyBadgeText: { fontWeight: '700', color: '#90c0e8' },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: 15, color: '#b0d0f0', fontWeight: '600' },
  historyMeta: { fontSize: 10, color: '#1e3a5a', fontFamily: 'Courier New', marginTop: 2 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#c0d0e0', marginBottom: 8 },
  emptyBody: { fontSize: 13, color: '#3a5070', textAlign: 'center', lineHeight: 20 },

  sectionLabel: { fontSize: 9, color: '#2a4a7a', letterSpacing: 3, fontFamily: 'Courier New', marginBottom: 8, marginTop: 20 },
  settingCard: { backgroundColor: '#08101e', borderWidth: 1, borderColor: '#162030', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  settingName: { fontSize: 14, color: '#c0d8f0', flex: 1 },
  settingHint: { fontSize: 11, color: '#2a4060', marginTop: 2 },
  settingValue: { fontSize: 12, color: '#4a7aaa', fontFamily: 'Courier New' },
  divider: { height: 1, backgroundColor: '#0f1e30' },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 14 },
  sliderChip: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#0d1829', borderWidth: 1, borderColor: '#1e3a5a', borderRadius: 8 },
  sliderChipActive: { borderColor: '#3a7bd5', backgroundColor: '#0c1e38' },
  sliderChipText: { fontSize: 12, color: '#2a5070', fontFamily: 'Courier New' },
  calNote: { fontSize: 12, color: '#4a6a8a', lineHeight: 20, paddingVertical: 14 },
});
