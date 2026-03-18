import { useState, useEffect, useRef } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

const HW = {
  L: { name: 'SIGNO-L', svc: '4faf...14b', char: 'beb...6a8' },
  R: { name: 'SIGNO-R', svc: '4faf...14c', char: 'beb...6a9' },
};

export function useBleGloves() {
  const ble = useRef(null);
  const devs = useRef({ L: null, R: null });

  const [status, setStatus] = useState('idle');
  const [left, setLeft] = useState({ flex: [0, 0, 0, 0, 0], ok: false });
  const [right, setRight] = useState({ flex: [0, 0, 0, 0, 0], ok: false });

  useEffect(() => {
    ble.current = new BleManager();
    return () => ble.current.destroy();
  }, []);

  const perms = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.requestMultiple([
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
    ]);
    return Object.values(res).every(r => r === 'granted');
  };

  const connect = async (dev, side) => {
    const conn = await dev.connect();
    await conn.discoverAllServicesAndCharacteristics();
    devs.current[side] = conn;

    conn.monitorCharacteristicForService(HW[side].svc, HW[side].char, (err, c) => {
      if (c?.value) {
        const data = JSON.parse(Buffer.from(c.value, 'base64').toString());
        const upd = { flex: data.f || [0, 0, 0, 0, 0], ok: true, time: Date.now() };
        if (side === 'L') setLeft(upd); else setRight(upd);
      }
    });
    setStatus(devs.current.L && devs.current.R ? 'connected' : 'partial');
  };

  const scan = async () => {
    if (!(await perms())) return setStatus('error');
    setStatus('scanning');
    ble.current.startDeviceScan(null, null, (err, d) => {
      if (d?.name === HW.L.name && !devs.current.L) connect(d, 'L');
      if (d?.name === HW.R.name && !devs.current.R) connect(d, 'R');
    });
    setTimeout(() => ble.current.stopDeviceScan(), 10000);
  };

  const off = async () => {
    ble.current.stopDeviceScan();
    if (devs.current.L) await devs.current.L.cancelConnection();
    if (devs.current.R) await devs.current.R.cancelConnection();
    devs.current = { L: null, R: null };
    setLeft({ flex: [0, 0, 0, 0, 0], ok: false });
    setRight({ flex: [0, 0, 0, 0, 0], ok: false });
    setStatus('idle');
  };

  return { left, right, status, scan, off };
}

