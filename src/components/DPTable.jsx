import { memo, useEffect, useRef, useState } from 'react';

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
  const [hv, setHv] = useState(null); // ô đang rê chuột { i, j }
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

  // ---- Rê chuột: tìm bước 'fill' của ô để giải thích và tô ô phụ thuộc ----
  let hoverTitle = 'Rê chuột vào một ô';
  let hoverText = 'để xem ô đó được tính như thế nào (viền đen: ô đang trỏ, viền nâu: ô phía trên, viền xanh: ô lùi trái h[i] cột).';
  if (hv) {
    const { i, j } = hv;
    if (!isVisible(i, j)) { hoverTitle = `m[${i}][${j}]`; hoverText = 'Ô này chưa được tính ở bước hiện tại.'; }
    else if (i === 0) { hoverTitle = `m[0][${j}] = 0`; hoverText = 'Trường hợp cơ sở: chưa xét cuốn sách nào nên không có trang nào.'; }
    else if (j === 0) { hoverTitle = `m[${i}][0] = 0`; hoverText = 'Trường hợp cơ sở: có 0 tiền nên không mua được cuốn nào.'; }
    else {
      const b = steps[buocCuaO(i, j, x)];
      hoverTitle = `m[${i}][${j}] = ${b.value}`;
      hoverText = b.message;
      marks[i].push(`${j}:hv-self`);
      marks[b.oTren.i].push(`${b.oTren.j}:hv-tren`);
      if (b.oTrai) marks[b.oTrai.i].push(`${b.oTrai.j}:hv-trai`);
    }
  }

  function onOver(e) {
    const td = e.target.closest('td[data-j]');
    if (!td) return;
    const i = Number(td.dataset.i), j = Number(td.dataset.j);
    if (!hv || hv.i !== i || hv.j !== j) setHv({ i, j });
  }

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
      <div className="dp-box" ref={boxRef}>
        <table className="dp">
          <thead>
            <tr><th className="dp__corner" scope="col">i \ j</th>{cols}</tr>
          </thead>
          <tbody onMouseOver={onOver} onMouseLeave={() => setHv(null)}>
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
      <div className="hover-info" aria-live="polite"><b>{hoverTitle}</b> {hoverText}</div>
    </>
  );
}
