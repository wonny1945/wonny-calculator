import test from 'node:test';
import assert from 'node:assert/strict';
import { createCalculator, press, keyboardKey } from '../src/lib/calculator.js';

function calculate(...keys) {
  return keys.reduce(press, createCalculator());
}

test('starts at zero', () => {
  assert.equal(createCalculator().display, '0');
});

test('enters digits without leading zeroes or duplicate decimal points', () => {
  assert.equal(calculate('0', '2', '.', '5', '.', '0').display, '2.50');
});

test('adds, subtracts, multiplies and divides', () => {
  for (const [operator, result] of [['+', '10'], ['−', '6'], ['×', '16'], ['÷', '4']]) {
    assert.equal(calculate('8', operator, '2', '=').display, result);
  }
});

test('uses immediate execution for chained operations', () => {
  assert.equal(calculate('2', '+', '3', '×', '4', '=').display, '20');
});

test('replaces an operator before the next operand', () => {
  assert.equal(calculate('8', '+', '×', '2', '=').display, '16');
});

test('decimal arithmetic hides floating point noise', () => {
  assert.equal(calculate('0', '.', '1', '+', '0', '.', '2', '=').display, '0.3');
});

test('division by zero produces a recoverable error', () => {
  const state = calculate('8', '÷', '0', '=');
  assert.equal(state.display, 'Error');
  assert.equal(state.history.length, 0);
  assert.equal(press(state, '7').display, '7');
});

test('clear resets pending operations', () => {
  assert.equal(calculate('9', '+', 'AC', '2', '=').display, '2');
});

test('sign and percent transform the active number', () => {
  assert.equal(calculate('5', '0', '±', '%').display, '-0.5');
});

test('backspace removes digits and restores zero', () => {
  assert.equal(calculate('1', '2', '⌫', '⌫').display, '0');
});

test('a digit after equals starts a fresh calculation', () => {
  assert.equal(calculate('2', '+', '3', '=', '7').display, '7');
});

test('an operator after equals continues from the result', () => {
  assert.equal(calculate('2', '+', '3', '=', '×', '2', '=').display, '10');
});

test('equals without a second operand is a no-op', () => {
  const state = calculate('2', '+', '=');
  assert.equal(state.display, '2');
  assert.equal(state.history.length, 0);
});

test('records completed expressions, newest first, with a limit of 5', () => {
  let state = createCalculator();
  for (let i = 1; i <= 6; i++) {
    state = ['AC', String(i), '+', '1', '='].reduce(press, state);
  }
  assert.equal(state.history.length, 5);
  assert.deepEqual(state.history[0], { expression: '6 + 1', result: '7' });
});

test('limits input to 12 digits and ignores unknown keys', () => {
  const state = calculate(...'123456789012345', 'unknown');
  assert.equal(state.display, '123456789012');
});

test('keyboard shortcuts map to the same actions as buttons', () => {
  for (const [key, action] of [['4', '4'], ['*', '×'], ['/', '÷'], ['-', '−'], ['Enter', '='], ['Escape', 'AC'], ['Backspace', '⌫']]) {
    assert.equal(keyboardKey(key), action);
  }
  assert.equal(keyboardKey('Tab'), null);
});

test('transitions do not mutate an earlier state', () => {
  const original = calculate('1', '+', '2');
  const snapshot = structuredClone(original);
  press(original, '=');
  assert.deepEqual(original, snapshot);
});
