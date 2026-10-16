import { useEffect, useState } from 'react';
import { TaoCacBuoc } from './algorithms/knapsack.js';
import Header from './components/Header.jsx';
import InputScene from './components/InputScene.jsx';
import ConsiderScene from './components/ConsiderScene.jsx';
import CheckoutScene from './components/CheckoutScene.jsx';
import StepControls from './components/StepControls.jsx';
import { EXAMPLES, toForm } from './examples.js';
import './styles.css';

// Thời gian chờ giữa 2 bước khi tự chạy, theo mức tốc độ 1..5 (ms)
const DELAYS = [0, 1200, 700, 350, 120, 30];

export default function App() {
  const [form, setForm] = useState(() => toForm(EXAMPLES[0]));
  const [data, setData] = useState(null);     // { n, x, h, s } đã kiểm tra hợp lệ
  const [result, setResult] = useState(null); // { m, steps } từ TaoCacBuoc
  const [k, setK] = useState(0);              // vị trí bước hiện tại
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);

  const steps = result ? result.steps : [];
  const last = steps.length - 1;
  const step = steps[k];
  const scene = !result ? 'input' : (step.phase === 'init' || step.phase === 'fill' ? 'consider' : 'checkout');
  const firstTrace = data ? 1 + data.n * data.x : 0;

  // Bấm "Bước vào tiệm"
  function start(parsed, mode) {
    const r = TaoCacBuoc(parsed.h, parsed.s, parsed.n, parsed.x);
    setData(parsed);
    setResult(r);
    setK(mode === 'result' ? r.steps.length - 1 : 0);
    setPlaying(false);
  }

  function backToInput() {
    setResult(null);
    setData(null);
    setPlaying(false);
  }

  const go = (to) => setK(Math.max(0, Math.min(last, to)));

  // "Xét xong cuốn này": nhảy tới ô cuối dòng i (m[i][x]); nếu đang ở đó thì sang dòng sau
  function finishBook() {
    if (!step || step.phase === 'trace' || step.phase === 'done') return;
    const { n, x } = data;
    const i = step.phase === 'init' ? 1 : step.i;
    const endOfRow = (r) => 1 + (r - 1) * x + (x - 1);
    let target = endOfRow(i);
    if (k >= target) target = i < n ? endOfRow(i + 1) : firstTrace;
    go(target);
  }

  // Tự chạy
  useEffect(() => {
    if (!playing) return undefined;
    if (k >= last) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setK((v) => Math.min(last, v + 1)), DELAYS[speed]);
    return () => clearTimeout(t);
  }, [playing, k, speed, last]);

  // Phím mũi tên trái/phải để lùi/tới (khi không gõ trong ô nhập)
  useEffect(() => {
    if (!result) return undefined;
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setK((v) => Math.min(last, v + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setK((v) => Math.max(0, v - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, last]);

  return (
    <div className="app">
      <Header scene={scene} data={data} onRestart={backToInput} />

      {scene === 'input' && <InputScene form={form} setForm={setForm} onStart={start} />}
      {scene === 'consider' && <ConsiderScene data={data} result={result} k={k} />}
      {scene === 'checkout' && <CheckoutScene data={data} result={result} k={k} firstTrace={firstTrace} onRestart={backToInput} />}

      {scene !== 'input' && (
        <StepControls
          k={k}
          last={last}
          step={step}
          data={data}
          firstTrace={firstTrace}
          playing={playing}
          speed={speed}
          onGo={go}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeed={setSpeed}
          onFinishBook={finishBook}
        />
      )}
    </div>
  );
}
