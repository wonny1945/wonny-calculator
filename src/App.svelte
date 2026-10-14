<script>
  import { createCalculator, press, keyboardKey } from './lib/calculator.js';
  import { isTauri } from '@tauri-apps/api/core';
  import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
  import { onMount } from 'svelte';

  let calculator = $state(createCalculator());
  let big = $state(false);
  let windowError = $state('');
  let theme = $state('ivory');
  onMount(() => {
    try {
      const saved = localStorage.getItem('wonny-theme');
      if (saved && ['ivory', 'sage', 'midnight'].includes(saved)) theme = saved;
    } catch { /* Theme remains usable when storage is unavailable. */ }
  });
  function saveTheme() {
    try { localStorage.setItem('wonny-theme', theme); } catch { /* Keep the session selection. */ }
  }

  /** @param {'close' | 'minimize' | 'expand'} action */
  async function windowAction(action) {
    try {
      windowError = '';
      if (action === 'expand') {
        const next = !big;
        if (isTauri()) await getCurrentWindow().setSize(new LogicalSize(next ? 440 : 360, next ? 680 : 560));
        big = next;
      } else if (isTauri()) {
        await getCurrentWindow()[action]();
      }
    } catch {
      windowError = '창 조작을 완료하지 못했습니다.';
    }
  }
  const keys = [
    ['AC', '초기화', 'utility'], ['±', '부호 변경', 'utility'], ['%', '백분율', 'utility'], ['÷', '나누기', 'operator'],
    ['7', '7', ''], ['8', '8', ''], ['9', '9', ''], ['×', '곱하기', 'operator'],
    ['4', '4', ''], ['5', '5', ''], ['6', '6', ''], ['−', '빼기', 'operator'],
    ['1', '1', ''], ['2', '2', ''], ['3', '3', ''], ['+', '더하기', 'operator'],
    ['⌫', '한 자리 지우기', 'utility'], ['0', '0', ''], ['.', '소수점', ''], ['=', '계산', 'equals'],
  ];

  /** @param {KeyboardEvent} event */
  function handleKeyboard(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return;
    const key = keyboardKey(event.key);
    if (key) {
      event.preventDefault();
      calculator = press(calculator, key);
    }
  }
</script>

<svelte:window onkeydown={handleKeyboard} />

<main aria-label="Wonny Calculator" class:big data-theme={theme}>
      <div class="calculator">
        <div class="window-controls" data-tauri-drag-region>
          <button class="window-control close" aria-label="앱 닫기" onclick={() => windowAction('close')}></button>
          <button class="window-control minimize" aria-label="최소화" onclick={() => windowAction('minimize')}></button>
          <button class="window-control expand" aria-label={big ? '일반 크기로 전환' : '큰 크기로 전환'} aria-pressed={big} onclick={() => windowAction('expand')}></button>
          <div class="theme-switch" role="group" aria-label="색상 테마" style:--theme-position={['ivory', 'sage', 'midnight'].indexOf(theme)}>
            {#each [['ivory', '아이보리'], ['sage', '세이지'], ['midnight', '미드나이트']] as [value, label]}
              <button class="theme-stop {value}" class:active={theme === value} aria-label={label} aria-pressed={theme === value} onclick={() => { theme = value; saveTheme(); }}><span></span></button>
            {/each}
          </div>
        </div>
        <div class="device-heading" data-tauri-drag-region><span data-tauri-drag-region>wonny <b>®</b></span><span class="device-type" data-tauri-drag-region>CALCULATOR / WC–01</span></div>
        <div class="screen">
          <div class="screen-top"><span>STANDARD</span><span class="screen-indicator">●</span></div>
          <div class="expression">{calculator.operator && calculator.operand !== null ? `${calculator.operand} ${calculator.operator}` : '—'}</div>
          <output class:compact={calculator.display.length > 9} class:error={calculator.display === 'Error'} aria-live="polite" aria-label="계산 결과">{calculator.display}</output>
        </div>
        <div class="keypad">
          {#each keys as [key, label, type]}
            <button class="key {type}" class:selected={calculator.operator === key} aria-label={label} onclick={() => calculator = press(calculator, key)}>{key}</button>
          {/each}
        </div>
        <div class="device-footer"><span class="device-lines" aria-hidden="true"></span><span>EVERYDAY INSTRUMENT</span><span>01</span></div>
        {#if windowError}<p role="alert">{windowError}</p>{/if}
      </div>

</main>
