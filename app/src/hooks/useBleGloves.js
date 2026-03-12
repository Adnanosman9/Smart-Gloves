import { useState, useEffect, useRef, useCallback } from 'react';
import { BleManager, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

const GLOVES = {
  L: { name: 'SIGNLINK-L', serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b', charUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8' },
  R: { name: 'SIGNLINK-R', serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914c', charUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a9' },
};

const blank = { flex: [0,0,0,0,0], imu: { ax:0, ay:0, az:0, gx:0, gy:0, gz:0 }, lastUpdate: 0, connected: false, rssi: null };

export function useBleGloves() {
  const ble  = useRef(null);
  const devs = useRef({ L: null, R: null });
  const subs = useRef({ L: null, R: null });

  const [status, setStatus] = useState('idle');
  const [leftGlove,  setLeft]  = useState({ ...blank });
  const [rightGlove, setRight] = useState({ ...blank });
  const [count, setCount] = useState(0);

  useEffect(() => {
    ble.current = new BleManager();
    return () => ble.current?.destroy();
  }, []);

  const getPerms = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 31) {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(res).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    }
    return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION))
      === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const parse = useCallback((b64) => {
    const data = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return {
      flex: data.f || [0,0,0,0,0],
      imu: { ax: data.a?.[0]??0, ay: data.a?.[1]??0, az: data.a?.[2]??0, gx: data.g?.[0]??0, gy: data.g?.[1]??0, gz: data.g?.[2]??0 },
      lastUpdate: Date.now(), connected: true, rssi: null,
    };
  }, []);

  const subscribe = useCallback((device, hand) => {
    const set = hand === 'L' ? setLeft : setRight;
    subs.current[hand] = device.monitorCharacteristicForService(
      GLOVES[hand].serviceUUID, GLOVES[hand].charUUID,
      (err, char) => {
        if (err) { set(g => ({ ...g, connected: false })); setCount(c => Math.max(0, c - 1)); return; }
        if (char?.value) { const p = parse(char.value); if (p) set(p); }
      }
    );
  }, [parse]);

  const connect = useCallback(async (device, hand) => {
    const conn = await device.connect({ autoConnect: false });
    await conn.discoverAllServicesAndCharacteristics();
    devs.current[hand] = conn;
    conn.readRSSI().then(rssi => { (hand === 'L' ? setLeft : setRight)(g => ({ ...g, rssi })); });
    subscribe(conn, hand);
    (hand === 'L' ? setLeft : setRight)(g => ({ ...g, connected: true }));
    setCount(c => { const n = c + 1; setStatus(n >= 2 ? 'connected' : 'partial'); return n; });
  }, [subscribe]);

  const scan = useCallback(async () => {
    setStatus('scanning');
    setCount(0);
    if (!(await getPerms())) { setStatus('error'); return; }
    if ((await ble.current.state()) !== State.PoweredOn) { setStatus('error'); return; }

    const found = { L: false, R: false };
    ble.current.startDeviceScan(null, { allowDuplicates: false }, async (err, device) => {
      if (err) { setStatus('error'); return; }
      if (device?.name === GLOVES.L.name && !found.L) {
        found.L = true;
        ble.current.stopDeviceScan();
        await connect(device, 'L');
        if (!found.R) {
          ble.current.startDeviceScan(null, { allowDuplicates: false }, async (e2, d2) => {
            if (d2?.name === GLOVES.R.name && !found.R) { found.R = true; ble.current.stopDeviceScan(); await connect(d2, 'R'); }
          });
        }
      } else if (device?.name === GLOVES.R.name && !found.R) {
        found.R = true;
        await connect(device, 'R');
      }
    });

    setTimeout(() => { ble.current.stopDeviceScan(); if (!found.L && !found.R) setStatus('error'); }, 15000);
  }, [getPerms, connect]);

  const disconnect = useCallback(async () => {
    ble.current?.stopDeviceScan();
    subs.current.L?.remove();
    subs.current.R?.remove();
    await devs.current.L?.cancelConnection();
    await devs.current.R?.cancelConnection();
    devs.current = { L: null, R: null };
    setLeft({ ...blank });
    setRight({ ...blank });
    setCount(0);
    setStatus('idle');
  }, []);

  return { leftGlove, rightGlove, status, count, scan, disconnect };
}

