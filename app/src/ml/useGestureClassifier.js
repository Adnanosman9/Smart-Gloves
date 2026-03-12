import { useCallback, useRef } from 'react';
import { MODEL_WEIGHTS } from './modelWeights';

const words = new Set([
  'HELLO','YES','NO','PLEASE','THANKS','HELP','WATER',
  'FOOD','GOOD','BAD','MORE','STOP','NAME','LOVE','SORRY'
]);

function runTree(tree, features) {
  let node = 0;
  while (true) {
    const { feature, threshold, left, right, value } = tree[node];
    if (feature === -1) return value;
    node = features[feature] <= threshold ? left : right;
  }
}

function runForest(features) {
  const n = MODEL_WEIGHTS.classes.length;
  const votes = new Array(n).fill(0);
  for (const tree of MODEL_WEIGHTS.trees) {
    const dist = runTree(tree, features);
    for (let i = 0; i < n; i++) votes[i] += dist[i];
  }
  const total = votes.reduce((a, b) => a + b, 0);
  const proba = votes.map(v => v / total);
  const best = proba.indexOf(Math.max(...proba));
  return {
    label: MODEL_WEIGHTS.classes[best],
    confidence: proba[best],
    type: words.has(MODEL_WEIGHTS.classes[best]) ? 'word' : 'letter',
  };
}

const winSize = 6;
const minConf = 0.72;
const gap = 1800;

export function useGestureClassifier() {
  const win = useRef([]);
  const lastLabel = useRef(null);
  const lastTime = useRef(0);

  const classify = useCallback((leftFlex, rightFlex, leftImu, rightImu) => {
    const features = [
      ...leftFlex, leftImu.ax, leftImu.ay, leftImu.az,
      ...rightFlex, rightImu.ax, rightImu.ay, rightImu.az,
    ];
    if (features.length !== 16 || features.some(isNaN)) return null;

    const result = runForest(features);
    win.current.push(result.label);
    if (win.current.length > winSize) win.current.shift();
    if (win.current.length < winSize) return null;

    const counts = {};
    for (const l of win.current) counts[l] = (counts[l] || 0) + 1;
    const [top, topN] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    if (topN / winSize < 0.7) return null;
    if (result.confidence < minConf) return null;

    const now = Date.now();
    if (top === lastLabel.current && now - lastTime.current < gap) return null;

    lastLabel.current = top;
    lastTime.current = now;
    return { label: top, confidence: result.confidence, type: words.has(top) ? 'word' : 'letter' };
  }, []);

  return { classify };
}
