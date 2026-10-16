// Khung giải thích bước hiện tại ở cảnh Cân nhắc
export default function ExplainPanel({ step, shelfCount }) {
  if (step.phase === 'init') {
    return (
      <div className="explain">
        <div className="explain__phase">Bước 1 · Khởi tạo</div>
        <h2>Trường hợp cơ sở</h2>
        <p>{step.message}</p>
        <p className="muted">Bấm tới để bắt đầu điền bảng từ ô m[1][1].</p>
      </div>
    );
  }

  const { i, j, gia, trang, oTren, oTrai, giaTriMua, luaChon, value } = step;
  const shelf = Math.ceil(i / 20);
  let verdict;
  if (luaChon === 'thieu-tien') verdict = `Không đủ tiền → không mua, ghi ${value} vào m[${i}][${j}]`;
  else if (luaChon === 'mua') verdict = `${giaTriMua} > ${oTren.value} → mua, ghi ${value} vào m[${i}][${j}]`;
  else verdict = `${giaTriMua} ≤ ${oTren.value} → không mua, ghi ${value} vào m[${i}][${j}]`;

  return (
    <div className="explain">
      <div className="explain__phase">Bước 2 · Điền bảng</div>
      <h2>Điền ô m[{i}][{j}]</h2>
      <p>Có <b>${j}</b>, đang cân nhắc <b>cuốn {i}</b> (giá ${gia}, {trang} trang){shelfCount > 1 ? ` trên kệ ${shelf}` : ''}. Có nên mua không?</p>
      <div className="option option--khong">
        <b>Không mua cuốn {i}</b>
        <code>m[{oTren.i}][{oTren.j}] = {oTren.value}</code>
      </div>
      <div className="option option--mua">
        <b>Mua cuốn {i}</b>
        {oTrai
          ? <code>m[{oTrai.i}][{j}−{gia}] + {trang} = {oTrai.value} + {trang} = {giaTriMua}</code>
          : <code>Không đủ tiền: giá ${gia} &gt; ${j}</code>}
      </div>
      <div className="verdict">{verdict}</div>
      <div className="formula">m[i][j] = max(m[i−1][j],<br />&nbsp;&nbsp;m[i−1][j−h[i]] + s[i]) nếu h[i] ≤ j</div>
    </div>
  );
}
