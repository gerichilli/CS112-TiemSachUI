const PHASES = [
  { id: 'input', label: '1 · Bước vào tiệm' },
  { id: 'consider', label: '2 · Cân nhắc' },
  { id: 'checkout', label: '3 · Thanh toán' },
];

export default function Header({ scene, data, onRestart }) {
  return (
    <header className="header">
      <div className="header__brand">
        <p className="header__title">Tiệm Sách</p>
        {data
          ? <span className="chip">n = {data.n}, x = {data.x}</span>
          : <span className="header__sub">Minh họa quy hoạch động cho bài toán Tiệm sách</span>}
        {data && <button type="button" className="btn btn--dashed" onClick={onRestart}>Nhập lại dữ liệu</button>}
      </div>
      <ol className="phases" aria-label="Các giai đoạn">
        {PHASES.map((p) => (
          <li key={p.id} aria-current={p.id === scene ? 'step' : undefined}>{p.label}</li>
        ))}
      </ol>
    </header>
  );
}
