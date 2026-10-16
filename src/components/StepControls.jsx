const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={d} /></svg>
);

export default function StepControls({ k, last, step, data, firstTrace, playing, speed, onGo, onTogglePlay, onSpeed, onFinishBook }) {
  const { n, x } = data;
  const inFill = step.phase === 'init' || step.phase === 'fill';

  let count;
  if (step.phase === 'init') count = 'Khởi tạo';
  else if (step.phase === 'fill') count = `Ô ${k} / ${n * x} · dòng ${step.i}`;
  else if (step.phase === 'trace') count = `Truy vết ${k - firstTrace + 1} / ${n}`;
  else count = 'Hoàn tất';

  return (
    <div className="controls" role="toolbar" aria-label="Điều khiển các bước">
      <div className="controls__group">
        <button type="button" className="ctl" aria-label="Về đầu" onClick={() => onGo(0)} disabled={k === 0}><Icon d="M6 5v14M18 6l-9 6 9 6z" /></button>
        <button type="button" className="ctl" aria-label="Lùi một bước" onClick={() => onGo(k - 1)} disabled={k === 0}><Icon d="M15 6l-6 6 6 6" /></button>
        <button type="button" className="ctl ctl--play" aria-label={playing ? 'Tạm dừng' : 'Tự chạy'} onClick={onTogglePlay} disabled={k === last && !playing}>
          {playing ? <Icon d="M8 5v14M16 5v14" /> : <Icon d="M8 5l11 7-11 7z" />}
        </button>
        <button type="button" className="ctl" aria-label="Tới một bước" onClick={() => onGo(k + 1)} disabled={k === last}><Icon d="M9 6l6 6-6 6" /></button>
        {inFill && <button type="button" className="ctl" onClick={onFinishBook}>Xét xong cuốn này</button>}
        <button type="button" className="ctl" aria-label="Tới cuối" onClick={() => onGo(last)} disabled={k === last}><Icon d="M18 5v14M6 6l9 6-9 6z" /></button>
      </div>
      <label>Tốc độ <input type="range" min="1" max="5" value={speed} onChange={(e) => onSpeed(Number(e.target.value))} /></label>
      <div className="controls__count" aria-live="polite">{count}</div>
      {inFill
        ? <button type="button" className="ctl" onClick={() => onGo(firstTrace)}>Bỏ qua tới Thanh toán</button>
        : <button type="button" className="ctl" onClick={() => onGo(firstTrace - 1)}>Xem lại bảng đã điền</button>}
    </div>
  );
}
