import { memo, useEffect, useRef } from 'react';

// Số thứ tự bước của ô m[i][j] (mục 4.4.2): steps[0] là 'init'
export const buocCuaO = (i, j, x) => 1 + (i - 1) * x + (j - 1);

/**
 * Một dòng của bảng. Chỉ vẽ lại khi giá trị, số ô hiện, hoặc chuỗi đánh dấu thay đổi
 * (bảng 101 x 101 có hơn 10.000 ô nên không vẽ lại cả bảng ở mỗi bước).
 * marks: chuỗi dạng "j:lop lop;j:lop" cho các ô cần tô trong dòng này.
 */
const Row = memo(function Row({ i, label, values, visible, marks, rowCur }) {
  const map = {};
  if (marks) for (const part of marks.split(';')) { const [j, cls] = part.split(':'); map[j] = (map[j] ? map[j] + ' ' : '') + cls; }
  const cells = [];
  for (let j = 0; j < values.length; j++) {
    const show = i === 0 || j === 0 || j <= visible;
    const baseCls = !show ? 'empty' : (i === 0 || j === 0 ? 'base' : '');
    const cls = (baseCls + ' ' + (map[j] || '')).trim();
    const tokens = cls.split(' ');
    const now = tokens.includes('now');
    cells.push(
      <td key={j} data-i={i} data-j={j} data-now={now ? '1' : undefined} className={tokens.filter((c) => c !== 'now').join(' ')}>
        {show ? values[j] : ''}
      </td>
    );
  }
  return (
    <tr>
      <th scope="row" className={rowCur ? 'row-cur' : ''}>{label}</th>
      {cells}
    </tr>
  );
});

export default function DPTable({ m, h, s, n, x, steps, k, mode, firstTrace }) {
  const boxRef = useRef(null);
  const tipRef = useRef(null);       // tooltip hiển thị cách tính ô
  const hvCells = useRef([]);        // các ô đang được tô khi rê chuột
  const step = steps[k];

  // ---- Số ô hiện ở mỗi dòng (cảnh Cân nhắc che các ô chưa tới lượt) ----
  let ci = 0, cj = 0;
  if (mode === 'consider' && step.phase === 'fill') { ci = step.i; cj = step.j; }
  const visibleOf = (i) => {
    if (mode === 'checkout') return x;
    if (step.phase === 'init') return 0;
    if (i < ci) return x;
    if (i === ci) return cj;
    return 0;
  };
  const isVisible = (i, j) => i === 0 || j === 0 || j <= visibleOf(i);

  // ---- Đánh dấu ô theo bước hiện tại ----
  const marks = Array.from({ length: n + 1 }, () => []);
  const colCls = {};
  if (mode === 'consider' && step.phase === 'fill') {
    marks[step.i].push(`${step.j}:cur now`);
    marks[step.oTren.i].push(`${step.oTren.j}:tren`);
    colCls[step.j] = 'col-cur';
    if (step.oTrai) { marks[step.oTrai.i].push(`${step.oTrai.j}:trai`); colCls[step.oTrai.j] = 'col-trai'; }
  }
  if (mode === 'checkout') {
    for (let t = firstTrace; t <= k; t++) {
      const b = steps[t];
      if (b.phase === 'trace') marks[b.i].push(`${b.j}:${b.mua ? 'tv-mua' : 'tv-khong'}${t === k ? ' tv-now now' : ''}`);
      if (b.phase === 'done') {
        const lastTrace = steps[t - 1];
        marks[0].push(`${lastTrace ? lastTrace.jSau : x}:tv-ket now`);
      }
    }
  }

  // ---- Rê chuột: tooltip giải thích cách tính ô ----
  // Không dùng state của React để tránh vẽ lại bảng mỗi lần rê chuột (gây giật).
  // Thay vào đó thêm/bỏ class trực tiếp trên các ô và cập nhật nội dung tooltip.
  function explain(i, j) {
    if (!isVisible(i, j)) return { title: `m[${i}][${j}]`, text: 'Ô này chưa được tính ở bước hiện tại.' };
    if (i === 0) return { title: `m[0][${j}] = 0`, text: 'Trường hợp cơ sở: chưa xét cuốn sách nào nên không có trang nào.' };
    if (j === 0) return { title: `m[${i}][0] = 0`, text: 'Trường hợp cơ sở: có 0 tiền nên không mua được cuốn nào.' };
    const b = steps[buocCuaO(i, j, x)];
    return { title: `m[${i}][${j}] = ${b.value}`, text: b.message, step: b };
  }

  function clearHover() {
    for (const [el, cls] of hvCells.current) el.classList.remove(cls);
    hvCells.current = [];
    if (tipRef.current) tipRef.current.hidden = true;
  }

  function mark(i, j, cls) {
    const el = boxRef.current.querySelector(`td[data-i="${i}"][data-j="${j}"]`);
    if (el) { el.classList.add(cls); hvCells.current.push([el, cls]); }
  }

  function onOver(e) {
    const td = e.target.closest('td[data-j]');
    if (!td) return;
    if (hvCells.current.length && hvCells.current[0][0] === td) return; // vẫn là ô cũ
    clearHover();
    const i = Number(td.dataset.i), j = Number(td.dataset.j);
    const info = explain(i, j);
    td.classList.add('hv-self'); hvCells.current.push([td, 'hv-self']);
    if (info.step) {
      mark(info.step.oTren.i, info.step.oTren.j, 'hv-tren');
      if (info.step.oTrai) mark(info.step.oTrai.i, info.step.oTrai.j, 'hv-trai');
    }
    const tip = tipRef.current;
    tip.querySelector('b').textContent = info.title;
    tip.querySelector('span').textContent = info.text;
    tip.hidden = false;
    // Đặt tooltip ngay dưới ô; nếu sát mép phải/dưới màn hình thì đẩy vào trong
    const r = td.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let left = r.left;
    let top = r.bottom + 6;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (top + h > window.innerHeight - 8) top = r.top - h - 6;
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${Math.max(8, top)}px`;
  }

  // Đổi bước hoặc cuộn bảng thì ẩn tooltip cũ
  useEffect(() => { clearHover(); }, [k, mode]);

  // ---- Tự cuộn để ô đang xét luôn nằm trong khung ----
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const el = box.querySelector('td[data-now]');
    if (!el) return;
    const head = box.querySelector('thead th');
    const side = box.querySelector('tbody th');
    const topPad = (head ? head.offsetHeight : 34) + 8;
    const leftPad = (side ? side.offsetWidth : 90) + 8;
    const c = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.right > c.right - 8) box.scrollLeft += r.right - c.right + 48;
    else if (r.left < c.left + leftPad) box.scrollLeft -= c.left + leftPad - r.left + 48;
    if (r.bottom > c.bottom - 8) box.scrollTop += r.bottom - c.bottom + 40;
    else if (r.top < c.top + topPad) box.scrollTop -= c.top + topPad - r.top + 40;
  }, [k, mode]);

  const cols = [];
  for (let j = 0; j <= x; j++) cols.push(<th key={j} scope="col" className={colCls[j] || ''}>{j}</th>);

  return (
    <>
      <div className="dp-box" ref={boxRef} onScroll={clearHover}>
        <table className="dp">
          <thead>
            <tr><th className="dp__corner" scope="col">i \ j</th>{cols}</tr>
          </thead>
          <tbody onMouseOver={onOver} onMouseLeave={clearHover}>
            {m.map((row, i) => (
              <Row
                key={i}
                i={i}
                label={i === 0 ? 'i=0' : `i=${i} (${h[i - 1]}, ${s[i - 1]})`}
                values={row}
                visible={visibleOf(i)}
                marks={marks[i].join(';')}
                rowCur={mode === 'consider' && i === ci && ci > 0}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="dp-tip" ref={tipRef} hidden role="tooltip"><b /> <span /></div>
      <p className="muted" style={{ margin: 0 }}>Rê chuột vào một ô để xem ô đó được tính như thế nào (viền đen: ô đang trỏ, viền nâu đứt: ô phía trên, viền xanh đứt: ô lùi trái h[i] cột).</p>
    </>
  );
}
