const operators = new Set(['+', '−', '×', '÷']);

/** @typedef {{expression: string, result: string}} HistoryEntry */
/** @typedef {{display: string, operand: number | null, operator: string | null, waiting: boolean, history: HistoryEntry[]}} Calculator */

/** @returns {Calculator} */
export function createCalculator() {
  return { display: '0', operand: null, operator: null, waiting: false, history: [] };
}

/** @param {number} value */
function format(value) {
  return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : 'Error';
}

/** @param {number} left @param {string} operator @param {number} right */
function evaluate(left, operator, right) {
  switch (operator) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return right === 0 ? NaN : left / right;
    default: return right;
  }
}

/** Pure state transition: UI and keyboard share the same calculator behavior.
 * @param {Calculator} previous @param {string} key @returns {Calculator}
 */
export function press(previous, key) {
  let state = { ...previous };
  if (key === 'AC') return { ...createCalculator(), history: state.history };
  if (!/^[0-9.]$/.test(key) && !operators.has(key) && !['=', '±', '%', '⌫'].includes(key)) return state;
  if (state.display === 'Error') state = { ...createCalculator(), history: state.history };

  if (/^[0-9.]$/.test(key)) {
    let display = state.waiting ? '0' : state.display;
    if (key === '.') {
      if (!display.includes('.') && !/[eE]/.test(display)) display += '.';
    } else if (display.replace(/[^0-9]/g, '').length < 12) {
      display = display === '0' ? key : display === '-0' ? `-${key}` : display + key;
    }
    return { ...state, display, waiting: false };
  }

  if (operators.has(key)) {
    let value = Number(state.display);
    if (state.operator && state.operand !== null && !state.waiting) {
      const display = format(evaluate(state.operand, state.operator, value));
      if (display === 'Error') return { ...createCalculator(), display, history: state.history };
      value = Number(display);
    }
    return { ...state, display: format(value), operand: value, operator: key, waiting: true };
  }

  if (key === '=') {
    if (!state.operator || state.operand === null || state.waiting) return state;
    const expression = `${format(state.operand)} ${state.operator} ${state.display}`;
    const display = format(evaluate(state.operand, state.operator, Number(state.display)));
    const history = display === 'Error' ? state.history : [{ expression, result: display }, ...state.history].slice(0, 5);
    return { ...state, display, operand: null, operator: null, waiting: true, history };
  }

  if (key === '⌫') {
    if (state.waiting) return state;
    const display = state.display.slice(0, -1);
    return { ...state, display: !display || display === '-' ? '0' : display };
  }
  return { ...state, display: format(key === '±' ? -Number(state.display) : Number(state.display) / 100) };
}

/** @param {string} key */
export function keyboardKey(key) {
  if (/^[0-9.]$/.test(key)) return key;
  return /** @type {Record<string, string>} */ ({ '+': '+', '-': '−', '*': '×', '/': '÷', Enter: '=', '=': '=', Escape: 'AC', Backspace: '⌫', '%': '%' })[key] ?? null;
}
