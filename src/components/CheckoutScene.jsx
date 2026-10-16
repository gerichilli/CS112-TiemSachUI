import Bookshelf, { Book } from './Bookshelf.jsx';
import { WalletReal } from './Wallet.jsx';
import DPTable from './DPTable.jsx';

// Cảnh 3: Thanh toán (truy vết + Output)
export default function CheckoutScene({ data, result, k, firstTrace, onRestart }) {
  const { n, x, h, s } = data;
  const { m, steps } = result;
  const done = steps[k].phase === 'done';
  const traces = steps.slice(firstTrace, k + 1).filter((b) => b.phase === 'trace');

  // Trạng thái tới bước hiện tại
  const kqNow = done ? steps[k].kq : (traces.length ? traces[traces.length - 1].kq : []);
  const bought = [...kqNow].sort((a, b) => a - b);
  const gone = new Set(bought);
  const payments = traces.filter((b) => b.mua).map((b) => ({ i: b.i, gia: h[b.i - 1] }));
  const trail = [x, ...traces.filter((b) => b.mua).map((b) => b.jSau)];
  const totalPrice = bought.reduce((sum, id) => sum + h[id - 1], 0);
  const totalPages = bought.reduce((sum, id) => sum + s[id - 1], 0);

  return (
    <>
      <div>
        <div className="muted">Còn trên kệ</div>
        <Bookshelf h={h} s={s} gone={gone} />
      </div>
      <div className="checkout-top">
        <div className="basket">
          <div className="muted">Giỏ hàng</div>
          <div className="basket__books">
            {bought.map((id) => <Book key={id} id={id} h={h[id - 1]} s={s[id - 1]} />)}
          </div>
          <div className="basket__box">{bought.length} cuốn · {totalPages} trang</div>
        </div>
        <WalletReal x={x} trail={trail} payments={payments} />
      </div>

      <div className="layout-2">
        <section className="ledger" aria-labelledby="truy-vet">
          <div className="ledger__head">
            <h2 id="truy-vet">Truy vết từ m[{n}][{x}]</h2>
            <span className="muted">So với ô phía trên: bằng → không mua, khác → mua</span>
          </div>
          <DPTable m={m} h={h} s={s} n={n} x={x} steps={steps} k={k} mode="checkout" firstTrace={firstTrace} />
          <ol className="trace-list">
            {traces.map((b, idx) => (
              <li key={idx} className={!done && idx === traces.length - 1 ? 'now' : ''}>{b.message}</li>
            ))}
            {done && <li className="now">i = 0 → kết thúc. {steps[k].message}</li>}
          </ol>
        </section>

        <section className="side" aria-labelledby="hoa-don">
          <div className="receipt">
            <div className="receipt__shop">TIỆM SÁCH</div>
            <h2 id="hoa-don">HÓA ĐƠN</h2>
            <div className="receipt__rule" />
            <div className="receipt__row receipt__row--head"><span>Sách</span><span>Giá</span><span>Trang</span></div>
            <div className="receipt__items">
              {bought.length === 0 && <span className="receipt__pending">{done ? 'Không mua được cuốn nào' : 'Chưa có cuốn nào'}</span>}
              {bought.map((id) => (
                <div key={id} className="receipt__row"><span>Cuốn {id}</span><span>{h[id - 1]}</span><span>{s[id - 1]}</span></div>
              ))}
            </div>
            <div className="receipt__rule" />
            <div className="receipt__row receipt__row--total"><span>Tổng</span><span>{totalPrice}</span><span>{totalPages}</span></div>
            <div className="receipt__row"><span>Tiền thừa</span><span /><span>{x - totalPrice}</span></div>
            <div className="receipt__rule" />
            {done ? (
              <>
                <div className="muted" style={{ fontFamily: 'var(--font-body)' }}>Output</div>
                <div className="receipt__out">{`${steps[k].dapAn}\n${bought.length}\n${bought.join(' ')}`}</div>
              </>
            ) : (
              <span className="receipt__pending">Đang truy vết, hóa đơn sẽ hoàn tất ở bước cuối.</span>
            )}
          </div>
          <button type="button" className="btn btn--primary" onClick={onRestart}>Vào tiệm lần nữa</button>
        </section>
      </div>
    </>
  );
}
