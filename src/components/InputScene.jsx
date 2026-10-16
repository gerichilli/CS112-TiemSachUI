import { useRef, useState } from 'react';
import { EXAMPLES, LIMITS, bookColor, toForm } from '../examples.js';

/**
 * Đọc nội dung file theo đúng định dạng đề Wecode:
 *   dòng 1: n x
 *   dòng 2: n số h[i]
 *   dòng 3: n số s[i]
 * Các số chỉ cần cách nhau bởi khoảng trắng hoặc xuống dòng.
 */
export function parseInputText(text) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return { error: 'File phải có ít nhất 2 số n và x ở dòng đầu.' };
  if (!tokens.every((t) => /^-?\d+$/.test(t))) return { error: 'File chỉ được chứa số nguyên.' };
  const nums = tokens.map(Number);
  const [n, x] = nums;
  if (n < 1 || n > LIMITS.nMax) return { error: `n = ${n} nằm ngoài giới hạn của giao diện (1 ≤ n ≤ ${LIMITS.nMax}).` };
  const need = 2 + 2 * n;
  if (nums.length < need) return { error: `Với n = ${n}, file cần ${need} số nhưng chỉ có ${nums.length}.` };
  if (nums.length > need) return { error: `Với n = ${n}, file cần ${need} số nhưng có tới ${nums.length}.` };
  const h = nums.slice(2, 2 + n), s = nums.slice(2 + n);
  return { data: { n, x, h, s } };
}

// Kiểm tra một ô nhập: phải là số nguyên trong [min, max]
function checkInt(text, min, max) {
  const t = String(text).trim();
  if (t === '') return { error: 'Chưa nhập giá trị' };
  if (!/^-?\d+$/.test(t)) return { error: 'Phải là số nguyên' };
  const v = Number(t);
  if (v < min || v > max) return { error: `Phải từ ${min} đến ${max}` };
  return { value: v };
}

// Kiểm tra toàn bộ form; trả về lỗi từng ô và dữ liệu đã chuyển thành số
export function validate(form) {
  const n = checkInt(form.n, 1, LIMITS.nMax);
  const x = checkInt(form.x, 1, LIMITS.xMax);
  const books = form.books.map((b) => ({
    h: checkInt(b.h, 1, LIMITS.hsMax),
    s: checkInt(b.s, 1, LIMITS.hsMax),
  }));
  let countError = null;
  if (!n.error && n.value !== form.books.length) {
    countError = `Danh sách đang có ${form.books.length} cuốn, khác với n = ${n.value}`;
  }
  const ok = !n.error && !x.error && !countError && books.every((b) => !b.h.error && !b.s.error);
  const parsed = ok
    ? { n: n.value, x: x.value, h: books.map((b) => b.h.value), s: books.map((b) => b.s.value) }
    : null;
  return { n, x, books, countError, ok, parsed };
}

export default function InputScene({ form, setForm, onStart }) {
  const v = validate(form);
  const fileRef = useRef(null);
  const [fileMsg, setFileMsg] = useState(null); // { ok, text }

  // Nạp dữ liệu từ file .txt / .inp
  async function onFile(e) {
    const file = e.target.files[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (!file) return;
    const r = parseInputText(await file.text());
    if (r.error) { setFileMsg({ ok: false, text: `Không đọc được "${file.name}": ${r.error}` }); return; }
    setForm({ ...toForm(r.data), mode: form.mode });
    setFileMsg({ ok: true, text: `Đã nạp "${file.name}": ${r.data.n} cuốn sách, x = ${r.data.x}.` });
  }
  const update = (patch) => setForm({ ...form, ...patch });

  // Đổi n thì danh sách sách tự thêm hoặc bớt dòng cho khớp
  function changeN(text) {
    const r = checkInt(text, 1, LIMITS.nMax);
    if (r.error) { update({ n: text }); return; }
    const books = form.books.slice(0, r.value);
    while (books.length < r.value) books.push({ h: '', s: '' });
    update({ n: text, books });
  }

  function changeBook(idx, key, text) {
    const books = form.books.map((b, i) => (i === idx ? { ...b, [key]: text } : b));
    update({ books });
  }

  function addBook() {
    if (form.books.length >= LIMITS.nMax) return;
    const books = [...form.books, { h: '', s: '' }];
    update({ books, n: String(books.length) });
  }

  function removeBook(idx) {
    if (form.books.length <= 1) return;
    const books = form.books.filter((_, i) => i !== idx);
    update({ books, n: String(books.length) });
  }

  function submit(e) {
    e.preventDefault();
    if (v.ok) onStart(v.parsed, form.mode);
  }

  return (
    <div className="input-layout">
      <form className="ledger input-form" onSubmit={submit} noValidate>
        <h1>Phiếu vào tiệm</h1>

        <div className="field-grid">
          <label className="field">Số cuốn sách (n)
            <input inputMode="numeric" value={form.n} onChange={(e) => changeN(e.target.value)}
              className={v.n.error ? 'input-invalid' : ''} aria-invalid={!!v.n.error} />
            {v.n.error ? <span className="error">{v.n.error}</span> : <span className="hint">1 ≤ n ≤ {LIMITS.nMax}</span>}
          </label>
          <label className="field">Tiền trong ví (x)
            <input inputMode="numeric" value={form.x} onChange={(e) => update({ x: e.target.value })}
              className={v.x.error ? 'input-invalid' : ''} aria-invalid={!!v.x.error} />
            {v.x.error ? <span className="error">{v.x.error}</span> : <span className="hint">1 ≤ x ≤ {LIMITS.xMax}</span>}
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 600 }}>Danh sách sách trên kệ</div>
          <div className="books">
            <table>
              <thead>
                <tr><th style={{ width: 90 }}>Cuốn</th><th>Giá h[i]</th><th>Số trang s[i]</th><th style={{ width: 56 }}><span className="sr-only">Xóa</span></th></tr>
              </thead>
              <tbody>
                {form.books.map((b, idx) => {
                  const id = idx + 1;
                  const err = v.books[idx];
                  return (
                    <tr key={idx}>
                      <td><div className="book-id"><span className="book-swatch" style={{ background: bookColor(id) }} />{id}</div></td>
                      <td>
                        <input aria-label={`Giá cuốn ${id}`} inputMode="numeric" value={b.h}
                          onChange={(e) => changeBook(idx, 'h', e.target.value)}
                          className={err.h.error ? 'input-invalid' : ''} aria-invalid={!!err.h.error} />
                        {err.h.error && <span className="error">{err.h.error}</span>}
                      </td>
                      <td>
                        <input aria-label={`Số trang cuốn ${id}`} inputMode="numeric" value={b.s}
                          onChange={(e) => changeBook(idx, 's', e.target.value)}
                          className={err.s.error ? 'input-invalid' : ''} aria-invalid={!!err.s.error} />
                        {err.s.error && <span className="error">{err.s.error}</span>}
                      </td>
                      <td>
                        <button type="button" className="icon-btn" aria-label={`Xóa cuốn ${id}`}
                          onClick={() => removeBook(idx)} disabled={form.books.length <= 1}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {v.countError && <span className="error">{v.countError}</span>}
          <button type="button" className="btn btn--dashed" style={{ alignSelf: 'flex-start' }}
            onClick={addBook} disabled={form.books.length >= LIMITS.nMax}>+ Thêm cuốn sách</button>
        </div>

        <div className="quick">
          <span className="muted">Nạp nhanh:</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} type="button" className="btn"
              onClick={() => { setForm({ ...toForm(ex), mode: form.mode }); setFileMsg(null); }}>Ví dụ {i + 1}</button>
          ))}
          <button type="button" className="btn" onClick={() => fileRef.current.click()}>Mở file .txt</button>
          <input ref={fileRef} type="file" accept=".txt,.inp,text/plain" hidden onChange={onFile} />
        </div>
        {fileMsg
          ? <span className={fileMsg.ok ? 'hint' : 'error'} role="status">{fileMsg.text}</span>
          : <span className="hint">File theo định dạng đề: dòng 1 là n x, dòng 2 là giá các cuốn, dòng 3 là số trang các cuốn.</span>}

        <fieldset className="mode">
          <legend>Chế độ</legend>
          <label><input type="radio" name="mode" checked={form.mode === 'step'} onChange={() => update({ mode: 'step' })} />Minh họa từng bước</label>
          <label><input type="radio" name="mode" checked={form.mode === 'result'} onChange={() => update({ mode: 'result' })} />Chỉ xem kết quả <span className="hint">(bỏ qua minh họa)</span></label>
        </fieldset>

        <div className="form-foot">
          <span className="muted" style={{ fontStyle: 'italic' }}>
            {v.ok ? 'Mỗi cuốn mua nhiều nhất một lần, tổng giá không vượt quá x' : 'Sửa các ô báo đỏ để tiếp tục'}
          </span>
          <button type="submit" className="btn btn--primary" disabled={!v.ok}>Bước vào tiệm</button>
        </div>
      </form>

      <aside className="sign-col" aria-label="Bảng hiệu tiệm">
        <div className="sign-rope" />
        <div className="sign">
          <div className="sign__est">— EST. 2026 —</div>
          <div className="sign__name">Tiệm<br />Sách</div>
          <div className="sign__tag">Mua nhiều trang nhất<br />với số tiền bạn có</div>
        </div>
        <div className="problem">
          <h2>Đề bài</h2>
          <p>Bạn đang ở trong một cửa hàng sách bán n cuốn sách khác nhau, biết giá và số trang của mỗi cuốn. Tổng giá mua tối đa là x. Số trang tối đa có thể mua là bao nhiêu, và cần mua những cuốn nào? Mỗi cuốn mua nhiều nhất một lần.</p>
        </div>
      </aside>
    </div>
  );
}
