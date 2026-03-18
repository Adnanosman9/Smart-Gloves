import { useRef } from 'react';
import { MODEL_WEIGHTS as weights } from './modelWeights';

const words = new Set(['HELLO', 'YES', 'NO', 'PLEASE', 'THANKS', 'HELP', 'WATER', 'FOOD', 'GOOD', 'BAD', 'MORE', 'STOP', 'NAME', 'LOVE', 'SORRY']);

function predict(features) {
  const n = weights.classes.length;
  const votes = new Array(n).fill(0);

  for (const t of weights.trees) {
    let node = 0;
    while (true) {
      const { feature: f, threshold: th, left: l, right: r, value: v } = t[node];
      if (f === -1) {
        for (let i = 0; i < n; i++) votes[i] += v[i];
        break;
      }
      node = features[f] <= th ? l : r;
    }
  }

  const best = votes.indexOf(Math.max(...votes));
  const label = weights.classes[best];
  return { label, type: words.has(label) ? 'word' : 'letter' };
}

export function useClassifier() {
  const win = useRef([]);
  const last = useRef(null);
  const time = useRef(0);

  const run = (leftFlex, rightFlex, leftImu, rightImu) => {
    const f = [...leftFlex, leftImu.ax, leftImu.ay, leftImu.az, ...rightFlex, rightImu.ax, rightImu.ay, rightImu.az];
    if (f.length !== 16) return null;

    const res = predict(f);
    win.current.push(res.label);
    if (win.current.length > 6) win.current.shift();
    if (win.current.length < 6) return null;

    const top = win.current.sort((a, b) => win.current.filter(v => v === a).length - win.current.filter(v => v === b).length).pop();
    const now = Date.now();
    if (top === last.current && now - time.current < 2000) return null;

    last.current = top;
    time.current = now;
    return { label: top, type: words.has(top) ? 'word' : 'letter' };
  };

  return { run };
}
