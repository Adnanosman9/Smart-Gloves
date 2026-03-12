/**
 * useGestureClassifier.js
 * ========================
 * Runs the gesture ML classifier in JavaScript.
 *
 * Since we can't run a .pkl in React Native directly, this file contains
 * a decision-tree ensemble ported from the Python model via `export_model.py`.
 *
 * To regenerate after retraining:
 *   python export_model.py        ← in the ml/ folder
 *   copy output modelWeights.js here
 *
 * The classifier takes a 16-float feature vector and returns:
 *   { label: string, confidence: number, type: 'letter'|'word' }
 */

import { useCallback, useRef } from 'react';
import { MODEL_WEIGHTS } from './modelWeights';

const WORDS = new Set([
  'HELLO','YES','NO','PLEASE','THANKS','HELP','WATER',
  'FOOD','GOOD','BAD','MORE','STOP','NAME','LOVE','SORRY'
]);

// Decision tree inference (single tree)
function predictTree(tree, features) {
  let node = 0;
  while (true) {
    const { feature, threshold, left, right, value } = tree[node];
    if (feature === -1) {
      // Leaf node — return class distribution
      return value;
    }
    node = features[feature] <= threshold ? left : right;
  }
}

// Random Forest: average predictions across all trees
function predictForest(features) {
  const nClasses = MODEL_WEIGHTS.classes.length;
  const votes = new Array(nClasses).fill(0);

  for (const tree of MODEL_WEIGHTS.trees) {
    const dist = predictTree(tree, features);
    for (let i = 0; i < nClasses; i++) {
      votes[i] += dist[i];
    }
  }

  // Normalize
  const total = votes.reduce((a, b) => a + b, 0);
  const proba = votes.map(v => v / total);
  const bestIdx = proba.indexOf(Math.max(...proba));

  return {
    label: MODEL_WEIGHTS.classes[bestIdx],
    confidence: proba[bestIdx],
    type: WORDS.has(MODEL_WEIGHTS.classes[bestIdx]) ? 'word' : 'letter',
    probabilities: proba,
  };
}

// Sliding window vote (debounce: gesture must be consistent over N frames)
const WINDOW_SIZE = 6;
const CONFIDENCE_THRESHOLD = 0.72;

export function useGestureClassifier() {
  const windowRef = useRef([]);
  const lastEmittedRef = useRef(null);
  const lastEmitTimeRef = useRef(0);
  const MIN_EMIT_INTERVAL = 1800; // ms between same gesture re-emit

  const classify = useCallback((leftFlex, rightFlex, leftImu, rightImu) => {
    // Build feature vector
    // [L_thumb, L_index, L_middle, L_ring, L_pinky, L_ax, L_ay, L_az,
    //  R_thumb, R_index, R_middle, R_ring, R_pinky, R_ax, R_ay, R_az]
    const features = [
      ...leftFlex,
      leftImu.ax, leftImu.ay, leftImu.az,
      ...rightFlex,
      rightImu.ax, rightImu.ay, rightImu.az,
    ];

    if (features.length !== 16 || features.some(isNaN)) return null;

    const result = predictForest(features);

    // Add to sliding window
    windowRef.current.push(result.label);
    if (windowRef.current.length > WINDOW_SIZE) {
      windowRef.current.shift();
    }

    // Only emit if window is full and majority agrees
    if (windowRef.current.length < WINDOW_SIZE) return null;

    const counts = {};
    for (const label of windowRef.current) {
      counts[label] = (counts[label] || 0) + 1;
    }
    const [topLabel, topCount] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];

    const windowConfidence = topCount / WINDOW_SIZE;
    if (windowConfidence < 0.7) return null;
    if (result.confidence < CONFIDENCE_THRESHOLD) return null;

    // Debounce same gesture
    const now = Date.now();
    if (
      topLabel === lastEmittedRef.current &&
      now - lastEmitTimeRef.current < MIN_EMIT_INTERVAL
    ) {
      return null;
    }

    lastEmittedRef.current = topLabel;
    lastEmitTimeRef.current = now;

    return {
      label: topLabel,
      confidence: result.confidence,
      type: WORDS.has(topLabel) ? 'word' : 'letter',
    };
  }, []);

  return { classify };
}
