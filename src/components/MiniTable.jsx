import { memo } from 'react';

// Một dòng: chỉ vẽ lại khi chuỗi 'sig' (nội dung + lớp CSS của dòng) thay đổi
const Row = memo(function Row({ label, cells }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {cells.map((c, j) => <td key={j} className={c.cls}>{c.v}</td>)}
    </tr>
  );
}, (a, b) => a.sig === b.sig);

/**
 * Bảng m đơn giản cho màn hình so sánh.
 * cellOf(i, j) trả về { v, cls } cho từng ô.
 */
export default function MiniTable({ n, x, h, s, cellOf, boxStyle }) {
  const cols = [];
  for (let j = 0; j <= x; j++) cols.push(<th key={j} scope="col">{j}</th>);
  const rows = [];
  for (let i = 0; i <= n; i++) {
    const cells = [];
    for (let j = 0; j <= x; j++) cells.push(cellOf(i, j));
    const sig = cells.map((c) => c.v + '|' + c.cls).join(',');
    rows.push(<Row key={i} sig={sig} cells={cells} label={i === 0 ? 'i=0' : `i=${i} (${h[i - 1]}, ${s[i - 1]})`} />);
  }
  return (
    <div className="dp-box" style={boxStyle}>
      <table className="dp">
        <thead><tr><th className="dp__corner" scope="col">i \ j</th>{cols}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
