// Ví "tiền giả định" ở cảnh Cân nhắc
export function WalletAssumed({ j }) {
  return (
    <div className="wallet">
      <div className="wallet__inner">
        <div>
          <div className="wallet__label">Giả sử trong ví có</div>
          <div className="wallet__amount">${j}</div>
        </div>
        <div className="wallet__note">cột j = {j}<br />(tiền giả định,<br />không phải tiền thật)</div>
      </div>
    </div>
  );
}

// Ví thật ở cảnh Thanh toán: trail là dãy số tiền sau mỗi lần trả
export function WalletReal({ x, trail, payments }) {
  const now = trail[trail.length - 1];
  return (
    <div className="wallet">
      <div className="wallet__inner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <div className="wallet__label">Ví thật · bắt đầu với ${x}</div>
        <div className="wallet__trail">
          {trail.slice(0, -1).map((v, i) => <span key={i}><s>${v}</s> →</span>)}
          <span className="wallet__amount" style={{ fontSize: 44 }}>${now}</span>
        </div>
        <div style={{ fontSize: 13 }}>
          {payments.length === 0 ? 'Chưa trả tiền cuốn nào' : payments.map((p) => `trả $${p.gia} cho cuốn ${p.i}`).join(', ')}
        </div>
      </div>
    </div>
  );
}
