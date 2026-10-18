import { useEffect, useMemo, useState } from 'react';
import { TaoCacBuocTopDown } from '../algorithms/knapsack.js';
import MiniTable from './MiniTable.jsx';

const DELAYS = [0, 1200, 700, 350, 120, 30];
const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={d} /></svg>
);

// Màn hình so sánh bottom-up (điền bảng) và top-down (đệ quy có nhớ), mục 2.6
export default function CompareScene({ data, result, onBack }) {
  const { n, x, h, s } = data;
  const { m } = result;
  const td = useMemo(() => TaoCacBuocTopDown(h, s, n, x), [h, s, n, x]);
  const steps = td.steps;
  const last = steps.length - 1;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const step = steps[t];

  // Bước mà mỗi ô được tính xong (để biết ô nào đã có giá trị ở bước t)
  const doneAt = useMemo(() => {
    const d = {};
    steps.forEach((b, k) => { if (b.phase === 'compute') d[`${b.i},${b.j}`] = k; });
    return d;
  }, [steps]);

  useEffect(() => {
    if (!playing) return undefined;
    if (t >= last) { setPlaying(false); return undefined; }
    const id = setTimeout(() => setT((v) => Math.min(last, v + 1)), DELAYS[speed]);
    return () => clearTimeout(id);
  }, [playing, t, speed, last]);

  const waiting = new Set(step.stack.map((c) => `${c.i},${c.j}`));

  const topDownCell = (i, j) => {
    if (i === 0 || j === 0) return { v: 0, cls: 'base' };
    const key = `${i},${j}`;
    const isCur = step.phase !== 'done' && step.i === i && step.j === j;
    const done = doneAt[key] !== undefined && doneAt[key] <= t;
    if (isCur && step.phase === 'reuse') return { v: m[i][j], cls: 'td-reuse' };
    if (isCur && step.phase === 'compute') return { v: m[i][j], cls: 'cur' };
    if (isCur && step.phase === 'call') return { v: '?', cls: 'td-call' };
    if (done) return { v: m[i][j], cls: 'td-done' };
    if (waiting.has(key)) return { v: '?', cls: 'td-wait' };
    return { v: '—', cls: 'td-none' };
  };
  const bottomUpCell = (i, j) => ({ v: m[i][j], cls: i === 0 || j === 0 ? 'base' : 'td-done' });

  const pct = Math.round((step.computed / (n * x)) * 100);

  return (
    <>
      <section className="ledger" aria-labelledby="ss-title">
        <div className="ledger__head">
          <h2 id="ss-title">So sánh bottom-up và đệ quy có nhớ (top-down)</h2>
          <button type="button" className="btn" onClick={onBack}>← Quay lại Thanh toán</button>
        </div>
        <div className="stats">
          <div className="stat"><span className="muted">Bottom-up (điền bảng)</span><b>{n * x} / {n * x}</b><span>ô được tính (100%)</span></div>
          <div className="stat"><span className="muted">Top-down, tới bước hiện tại</span><b>{step.computed} / {n * x}</b><span>ô được tính ({pct}%)</span></div>
          <div className="stat"><span className="muted">Top-down: lấy lại từ bảng</span><b>{step.reused}</b><span>lần (không tính lại)</span></div>
          <div className="stat"><span className="muted">Đáp án</span><b>{m[n][x]}</b><span>{step.phase === 'done' ? `hai cách bằng nhau (MF = ${td.value})` : 'top-down đang chạy…'}</span></div>
        </div>
      </section>

      <div className="layout-2">
        <section className="ledger" aria-labelledby="ss-td" style={{ flex: '999 1 640px' }}>
          <div className="ledger__head">
            <h2 id="ss-td">Top-down · MF({n}, {x})</h2>
            <span className="muted">"—": ô không cần tính</span>
          </div>
          <MiniTable n={n} x={x} h={h} s={s} cellOf={topDownCell} />
          <div className="legend">
            <span><i style={{ background: 'var(--cur-bg)', border: '2px solid var(--cur-line)' }} />Vừa tính xong</span>
            <span><i style={{ background: '#EEF3E6', border: '1px solid var(--line)' }} />Đã tính</span>
            <span><i style={{ background: 'var(--card)', border: '2px dashed var(--ink)' }} />Đang gọi / chờ kết quả</span>
            <span><i style={{ background: '#F6E2A8', border: '2px solid #8C6224' }} />Lấy lại từ bảng</span>
          </div>
        </section>
        <div className="side">
          <div className="explain">
            <div className="explain__phase">Đệ quy có nhớ · bước {t + 1} / {steps.length}</div>
            <p>{step.message}</p>
          </div>
          <div className="explain">
            <div className="explain__phase">Các lời gọi đang chờ (ngăn xếp)</div>
            {step.stack.length === 0
              ? <p className="muted">Không có lời gọi nào đang chờ.</p>
              : <ol className="callstack">{[...step.stack].reverse().map((c, k) => <li key={k}>MF({c.i}, {c.j}){k === 0 ? ' ← trên cùng' : ''}</li>)}</ol>}
          </div>
        </div>
      </div>

      <section className="ledger" aria-labelledby="ss-bu">
        <div className="ledger__head">
          <h2 id="ss-bu">Bottom-up · bảng m đầy đủ</h2>
          <span className="muted">Mọi ô đều được tính</span>
        </div>
        <MiniTable n={n} x={x} h={h} s={s} cellOf={bottomUpCell} boxStyle={{ maxHeight: 320 }} />
      </section>

      <div className="controls" role="toolbar" aria-label="Điều khiển đệ quy có nhớ">
        <div className="controls__group">
          <button type="button" className="ctl" aria-label="Về đầu" onClick={() => setT(0)} disabled={t === 0}><Icon d="M6 5v14M18 6l-9 6 9 6z" /></button>
          <button type="button" className="ctl" aria-label="Lùi một bước" onClick={() => setT(Math.max(0, t - 1))} disabled={t === 0}><Icon d="M15 6l-6 6 6 6" /></button>
          <button type="button" className="ctl ctl--play" aria-label={playing ? 'Tạm dừng' : 'Tự chạy'} onClick={() => setPlaying((p) => !p)} disabled={t === last && !playing}>
            {playing ? <Icon d="M8 5v14M16 5v14" /> : <Icon d="M8 5l11 7-11 7z" />}
          </button>
          <button type="button" className="ctl" aria-label="Tới một bước" onClick={() => setT(Math.min(last, t + 1))} disabled={t === last}><Icon d="M9 6l6 6-6 6" /></button>
          <button type="button" className="ctl" aria-label="Tới cuối" onClick={() => setT(last)} disabled={t === last}><Icon d="M18 5v14M6 6l9 6-9 6z" /></button>
        </div>
        <label>Tốc độ <input type="range" min="1" max="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label>
        <div className="controls__count">Bước {t + 1} / {steps.length}</div>
      </div>
    </>
  );
}
