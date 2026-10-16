// 4 ví dụ của Bảng 2.1 trong báo cáo
export const EXAMPLES = [
  { n: 4, x: 10, h: [4, 8, 5, 3], s: [5, 12, 8, 1] },
  { n: 3, x: 2, h: [3, 5, 4], s: [10, 20, 15] },
  { n: 3, x: 100, h: [10, 20, 30], s: [1, 2, 3] },
  { n: 3, x: 10, h: [6, 5, 5], s: [9, 7, 7] },
];

// Dữ liệu ví dụ -> trạng thái form (các ô nhập lưu dạng chuỗi)
export function toForm(ex) {
  return {
    n: String(ex.n),
    x: String(ex.x),
    books: ex.h.map((h, i) => ({ h: String(h), s: String(ex.s[i]) })),
    mode: 'step',
  };
}

// Màu gáy sách: cố định theo số thứ tự, chạy lại vẫn cùng màu
export const BOOK_COLORS = ['#7A2E2E', '#4E5D3A', '#2F4058', '#8C6224', '#5B3A5E'];
export const bookColor = (id) => BOOK_COLORS[(id - 1) % BOOK_COLORS.length];

export const LIMITS = { nMax: 100, xMax: 100, hsMax: 1000 };
