import Bookshelf from './Bookshelf.jsx';
import { WalletAssumed } from './Wallet.jsx';
import DPTable from './DPTable.jsx';
import ExplainPanel from './ExplainPanel.jsx';

// Cảnh 2: Cân nhắc (minh họa điền bảng m)
export default function ConsiderScene({ data, result, k }) {
  const { n, x, h, s } = data;
  const { m, steps } = result;
  const step = steps[k];
  const isFill = step.phase === 'fill';
  const shelfCount = Math.ceil(n / 20);

  return (
    <>
      <Bookshelf h={h} s={s} currentId={isFill ? step.i : null} laterFrom={isFill ? step.i : 0} />

      <div className="layout-2">
        <section className="ledger" aria-labelledby="so-tinh">
          <div className="ledger__head">
            <h2 id="so-tinh">Sổ tính toán · bảng m</h2>
            <span className="muted">m[i][j] = số trang tối đa với i cuốn đầu, tối đa j tiền</span>
          </div>
          <DPTable m={m} h={h} s={s} n={n} x={x} steps={steps} k={k} mode="consider" />
          <div className="legend">
            <span><i style={{ background: 'var(--cur-bg)', border: '2px solid var(--cur-line)' }} />Ô đang tính</span>
            <span><i style={{ background: 'var(--tren-bg)', border: '2px solid var(--tren-line)' }} />Không mua: ô phía trên</span>
            <span><i style={{ background: 'var(--trai-bg)', border: '2px solid var(--trai-line)' }} />Mua: lùi trái h[i] cột</span>
            <span><i style={{ background: 'var(--base-bg)', border: '1px solid var(--line)' }} />Trường hợp cơ sở</span>
          </div>
        </section>
        <div className="side">
          <WalletAssumed j={isFill ? step.j : 0} />
          {isFill && step.oTrai && (
            <div className="option option--mua" style={{ fontSize: 14 }}>
              Nếu mua cuốn {step.i}: trả ${step.gia} → còn ${step.j - step.gia} để mua {step.i - 1 === 0 ? 'các cuốn trước (không còn cuốn nào)' : `${step.i - 1} cuốn đầu`}
            </div>
          )}
          <ExplainPanel step={step} shelfCount={shelfCount} />
        </div>
      </div>
    </>
  );
}
