import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Storage from '@react-native-async-storage/async-storage';

export function HistoryScreen() {
  const [list, setList] = useState([]);

  useEffect(() => {
    Storage.getItem('signo_history').then(v => v && setList(JSON.parse(v)));
  }, []);

  const clear = async () => {
    await Storage.removeItem('signo_history');
    setList([]);
  };

  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.head}><Text style={styles.brand}>SIGNO</Text><Text style={styles.title}>History</Text></View>
      <View style={styles.bar}>
        <Text style={styles.num}>{list.length} saved</Text>
        <TouchableOpacity onPress={clear}><Text style={styles.clr}>CLEAR</Text></TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.txt}>{item.label}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export function SettingsScreen() {
  const [opt, setOpt] = useState({ auto: true, log: true });

  useEffect(() => {
    Storage.getItem('signo_opt').then(v => v && setOpt(JSON.parse(v)));
  }, []);

  const save = (upd) => {
    setOpt(upd);
    Storage.setItem('signo_opt', JSON.stringify(upd));
  };

  return (
    <SafeAreaView style={styles.base}>
      <View style={styles.head}><Text style={styles.brand}>SIGNO</Text><Text style={styles.title}>Settings</Text></View>
      <ScrollView style={{ padding: 20 }}>
        <View style={styles.row}><Text style={{ color: '#fff' }}>Auto-Speak</Text><Switch value={opt.auto} onValueChange={v => save({...opt, auto:v})} /></View>
        <View style={styles.row}><Text style={{ color: '#fff' }}>Save History</Text><Switch value={opt.log} onValueChange={v => save({...opt, log:v})} /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: '#080c14' },
  head: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1a2a40' },
  brand: { fontSize: 10, color: '#3a7bd5', letterSpacing: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  bar: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  num: { color: '#444' },
  clr: { color: '#ff4d6d' },
  item: { padding: 15, marginHorizontal: 20, marginBottom: 8, backgroundColor: '#0d1729', borderRadius: 8 },
  txt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  time: { color: '#444', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#0d1729', padding: 15, borderRadius: 10 }
});
