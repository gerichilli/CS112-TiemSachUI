import { bookColor } from '../examples.js';

const PER_SHELF = 20; // mỗi kệ 20 cuốn, tối đa 5 kệ (n ≤ 100)

// Một gáy sách
export function Book({ id, h, s, state = '' }) {
  return (
    <div className={`book ${state}`} aria-label={`Cuốn ${id}, giá ${h}, ${s} trang`}>
      <div className="book__price" aria-hidden="true">${h}</div>
      <div className="book__spine" style={{ background: bookColor(id) }} aria-hidden="true">
        <div className="book__band" />
        <div className="book__title">Cuốn {id} · {s} trang</div>
        <div className="book__band book__band--b" />
      </div>
    </div>
  );
}

/**
 * Kệ sách. currentId: cuốn đang kéo ra; laterFrom: các cuốn có id > laterFrom bị làm mờ;
 * gone: tập id các cuốn đã lấy khỏi kệ (cảnh Thanh toán).
 */
export default function Bookshelf({ h, s, currentId = null, laterFrom = null, gone = null }) {
  const n = h.length;
  const shelves = [];
  for (let start = 1; start <= n; start += PER_SHELF) {
    const ids = [];
    for (let id = start; id < start + PER_SHELF && id <= n; id++) ids.push(id);
    shelves.push(ids);
  }
  return (
    <section className="shelves" aria-label="Kệ sách">
      {shelves.map((ids, k) => (
        <div className="shelf" key={k}>
          {shelves.length > 1 && (
            <div className="shelf__label">Kệ {k + 1}<span>{ids[0]}–{ids[ids.length - 1]}</span></div>
          )}
          <div className="shelf__body">
            <div className="shelf__books">
              {ids.map((id) => {
                let state = '';
                if (gone && gone.has(id)) state = 'book--gone';
                else if (id === currentId) state = 'book--current';
                else if (laterFrom !== null && id > laterFrom) state = 'book--later';
                return <Book key={id} id={id} h={h[id - 1]} s={s[id - 1]} state={state} />;
              })}
            </div>
            <div className="shelf__plank" />
            <div className="shelf__shadow" />
          </div>
        </div>
      ))}
    </section>
  );
}
