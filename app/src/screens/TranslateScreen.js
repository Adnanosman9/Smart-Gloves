import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBleGloves } from '../hooks/useBleGloves';
import { useTTS } from '../hooks/useTTS';
import { useClassifier } from '../ml/useGestureClassifier';

export function TranslateScreen() {
  const { left, right, status, scan, off } = useBleGloves();
  const { speak, speaking, stop } = useTTS();
  const { run } = useClassifier();

  const [res, setRes] = useState(null);
  const [list, setList] = useState([]);
  const [auto, setAuto] = useState(true);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!left.ok && !right.ok) return;
    const out = run(left.flex, right.flex, left.imu || {ax:0,ay:0,az:0}, right.imu || {ax:0,ay:0,az:0});
    if (out) {
      setRes(out);
      setList(s => [...s, out.label].slice(-10));
      if (auto) speak(out.label);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
    }
  }, [left.time, right.time]);

  return (
    <SafeAreaView style={styles.base}>
      <ScrollView contentContainerStyle={styles.pad}>
        <View style={styles.row}>
          <View>
            <Text style={styles.brand}>SIGNO</Text>
            <Text style={styles.title}>Translator</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => status === 'idle' ? scan() : off()}>
            <Text style={styles.btnT}>{status === 'scanning' ? '...' : status === 'idle' ? 'CONNECT' : 'STOP'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.status}>
          <View style={styles.clr}><View style={[styles.dot, {backgroundColor: left.ok ? '#00e5a0' : '#222'}]} /><Text style={styles.dotL}>LEFT</Text></View>
          <Text style={styles.info}>{status}</Text>
          <View style={styles.clr}><View style={[styles.dot, {backgroundColor: right.ok ? '#00e5a0' : '#222'}]} /><Text style={styles.dotL}>RIGHT</Text></View>
        </View>

        <View style={styles.card}>
          <Animated.View style={{ transform: [{ scale }] }}>
            {res ? <Text style={styles.main}>{res.label}</Text> : <Text style={styles.wait}>Connecting...</Text>}
          </Animated.View>
          {res && (
            <TouchableOpacity style={styles.spk} onPress={() => speaking ? stop() : speak(res.label)}>
              <Text style={{color:'#4a90e2'}}>{speaking ? '...' : 'Speak'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.list}>
          <View style={styles.row}><Text style={styles.lbl}>SENTENCE</Text><TouchableOpacity onPress={() => setList([])}><Text style={styles.del}>Clear</Text></TouchableOpacity></View>
          <View style={{flexDirection:'row', flexWrap:'wrap'}}>{list.map((w, i) => <View key={i} style={styles.word}><Text style={{color:'#fff'}}>{w}</Text></View>)}</View>
        </View>

        <View style={styles.opt}>
          <Text style={{color:'#4a6a9a'}}>Auto-Speak</Text>
          <TouchableOpacity onPress={() => setAuto(!auto)}><Text style={{color: auto ? '#3a7bd5' : '#444'}}>{auto ? 'ON' : 'OFF'}</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#080c14' },
  pad: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { fontSize: 10, color: '#3a7bd5', letterSpacing: 3 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  btn: { padding: 10, backgroundColor: '#3a7bd5', borderRadius: 8 },
  btnT: { color: '#fff', fontWeight: 'bold' },
  status: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, alignItems: 'center' },
  clr: { alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotL: { fontSize: 10, color: '#444', marginTop: 4 },
  info: { fontSize: 14, color: '#3a7bd5' },
  card: { backgroundColor: '#0d1729', borderRadius: 15, padding: 40, alignItems: 'center', marginBottom: 20 },
  main: { fontSize: 72, fontWeight: 'bold', color: '#fff' },
  wait: { color: '#444' },
  spk: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#4a90e2', borderRadius: 5 },
  list: { backgroundColor: '#08101e', padding: 15, borderRadius: 10, marginBottom: 20 },
  lbl: { fontSize: 12, color: '#4a6a9a' },
  del: { color: '#ff4d6d' },
  word: { padding: 8, backgroundColor: '#1a2a40', margin: 4, borderRadius: 5 },
  opt: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#08101e', borderRadius: 10 }
});
