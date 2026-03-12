/**
 * useBleGloves.js
 * ================
 * Manages BLE connections to both SIGNLINK-L and SIGNLINK-R gloves.
 * Parses incoming JSON packets and provides merged sensor state.
 *
 * Usage:
 *   const { leftGlove, rightGlove, scanAndConnect, disconnect, status } = useBleGloves();
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BleManager, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

// ── BLE constants ─────────────────────────────────────────────────────────────
const GLOVES = {
  L: {
    name: 'SIGNLINK-L',
    serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    charUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
  },
  R: {
    name: 'SIGNLINK-R',
    serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914c',
    charUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a9',
  },
};

const DEFAULT_SENSOR = {
  flex: [0, 0, 0, 0, 0],
  imu: { ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0 },
  lastUpdate: 0,
  connected: false,
  rssi: null,
};

export function useBleGloves() {
  const managerRef = useRef(null);
  const devicesRef = useRef({ L: null, R: null });
  const subscriptionsRef = useRef({ L: null, R: null });

  const [status, setStatus] = useState('idle'); // idle | scanning | partial | connected | error
  const [errorMsg, setErrorMsg] = useState('');
  const [leftGlove, setLeftGlove]   = useState({ ...DEFAULT_SENSOR });
  const [rightGlove, setRightGlove] = useState({ ...DEFAULT_SENSOR });
  const [connectedCount, setConnectedCount] = useState(0);

  // Init BLE manager
  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  // Request Android BLE permissions
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const apiLevel = Platform.Version;
    if (apiLevel >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  }, []);

  // Parse incoming BLE packet
  const parsePacket = useCallback((base64Value, hand) => {
    try {
      const json = Buffer.from(base64Value, 'base64').toString('utf8');
      const data = JSON.parse(json);
      return {
        flex: data.f || [0,0,0,0,0],
        imu: {
          ax: data.a?.[0] ?? 0,
          ay: data.a?.[1] ?? 0,
          az: data.a?.[2] ?? 0,
          gx: data.g?.[0] ?? 0,
          gy: data.g?.[1] ?? 0,
          gz: data.g?.[2] ?? 0,
        },
        lastUpdate: Date.now(),
        connected: true,
        rssi: null,
      };
    } catch {
      return null;
    }
  }, []);

  // Subscribe to a glove's characteristic
  const subscribeToGlove = useCallback((device, hand) => {
    const { serviceUUID, charUUID } = GLOVES[hand];
    const setGlove = hand === 'L' ? setLeftGlove : setRightGlove;

    const sub = device.monitorCharacteristicForService(
      serviceUUID, charUUID,
      (error, characteristic) => {
        if (error) {
          console.warn(`${hand} glove monitor error:`, error.message);
          setGlove(g => ({ ...g, connected: false }));
          setConnectedCount(c => Math.max(0, c - 1));
          return;
        }
        if (characteristic?.value) {
          const parsed = parsePacket(characteristic.value, hand);
          if (parsed) setGlove(parsed);
        }
      }
    );
    subscriptionsRef.current[hand] = sub;
  }, [parsePacket]);

  // Connect to one glove by name
  const connectGlove = useCallback(async (device, hand) => {
    try {
      const connected = await device.connect({ autoConnect: false });
      await connected.discoverAllServicesAndCharacteristics();
      devicesRef.current[hand] = connected;

      // Update RSSI
      connected.readRSSI().then(rssi => {
        const setGlove = hand === 'L' ? setLeftGlove : setRightGlove;
        setGlove(g => ({ ...g, rssi }));
      }).catch(() => {});

      subscribeToGlove(connected, hand);

      const setGlove = hand === 'L' ? setLeftGlove : setRightGlove;
      setGlove(g => ({ ...g, connected: true }));
      setConnectedCount(c => {
        const next = c + 1;
        setStatus(next >= 2 ? 'connected' : 'partial');
        return next;
      });

      console.log(`${hand} glove connected`);
    } catch (err) {
      console.warn(`Failed to connect ${hand} glove:`, err.message);
    }
  }, [subscribeToGlove]);

  // Main scan + connect
  const scanAndConnect = useCallback(async () => {
    setStatus('scanning');
    setErrorMsg('');
    setConnectedCount(0);

    const granted = await requestPermissions();
    if (!granted) {
      setErrorMsg('Bluetooth permissions denied. Please enable in Settings.');
      setStatus('error');
      return;
    }

    const bleState = await managerRef.current.state();
    if (bleState !== State.PoweredOn) {
      setErrorMsg('Bluetooth is off. Please enable Bluetooth and try again.');
      setStatus('error');
      return;
    }

    const found = { L: false, R: false };

    managerRef.current.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        setErrorMsg(`Scan error: ${error.message}`);
        setStatus('error');
        return;
      }

      if (device?.name === GLOVES.L.name && !found.L) {
        found.L = true;
        managerRef.current.stopDeviceScan();
        await connectGlove(device, 'L');
        // Resume scan for right glove
        if (!found.R) {
          managerRef.current.startDeviceScan(null, { allowDuplicates: false }, async (e2, d2) => {
            if (d2?.name === GLOVES.R.name && !found.R) {
              found.R = true;
              managerRef.current.stopDeviceScan();
              await connectGlove(d2, 'R');
            }
          });
        }
      } else if (device?.name === GLOVES.R.name && !found.R) {
        found.R = true;
        await connectGlove(device, 'R');
      }
    });

    // Timeout after 15s
    setTimeout(() => {
      managerRef.current.stopDeviceScan();
      if (!found.L && !found.R) {
        setErrorMsg('No gloves found. Make sure both are powered on and in range.');
        setStatus('error');
      }
    }, 15000);
  }, [requestPermissions, connectGlove]);

  // Disconnect all
  const disconnect = useCallback(async () => {
    managerRef.current?.stopDeviceScan();
    subscriptionsRef.current.L?.remove();
    subscriptionsRef.current.R?.remove();
    await devicesRef.current.L?.cancelConnection().catch(() => {});
    await devicesRef.current.R?.cancelConnection().catch(() => {});
    devicesRef.current = { L: null, R: null };
    setLeftGlove({ ...DEFAULT_SENSOR });
    setRightGlove({ ...DEFAULT_SENSOR });
    setConnectedCount(0);
    setStatus('idle');
  }, []);

  return {
    leftGlove,
    rightGlove,
    status,
    errorMsg,
    connectedCount,
    scanAndConnect,
    disconnect,
  };
}
