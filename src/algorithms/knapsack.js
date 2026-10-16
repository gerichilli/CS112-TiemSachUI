// Bài toán Tiệm sách - Quy hoạch động (bottom-up)
// Quy ước: sách được đánh số từ 1 đến n như trong báo cáo.
// Mảng h, s của JavaScript bắt đầu từ 0, nên cuốn thứ i có giá h[i-1], số trang s[i-1].

/**
 * Điền bảng phương án m theo công thức (2.1).
 * @param {number[]} h - giá các cuốn sách (h[0] là giá cuốn 1)
 * @param {number[]} s - số trang các cuốn sách (s[0] là số trang cuốn 1)
 * @param {number} n - số cuốn sách
 * @param {number} x - số tiền tối đa
 * @returns {number[][]} bảng m kích thước (n+1) x (x+1)
 */
export function DienBang(h, s, n, x) {
  // Tạo bảng m gồm (n+1) dòng, (x+1) cột
  const m = [];
  for (let i = 0; i <= n; i++) {
    m.push(new Array(x + 1));
  }

  // Bước 1: Khởi tạo trường hợp cơ sở
  for (let j = 0; j <= x; j++) m[0][j] = 0; // dòng 0: chưa xét cuốn nào
  for (let i = 0; i <= n; i++) m[i][0] = 0; // cột 0: không có tiền

  // Bước 2: Điền bảng từng dòng, từ trên xuống
  for (let i = 1; i <= n; i++) {
    const gia = h[i - 1];   // giá cuốn thứ i
    const trang = s[i - 1]; // số trang cuốn thứ i

    for (let j = 1; j <= x; j++) {
      // Lựa chọn 1: không mua cuốn i
      // => giữ nguyên kết quả của i-1 cuốn đầu với j tiền
      m[i][j] = m[i - 1][j];

      // Lựa chọn 2: mua cuốn i (chỉ xét khi đủ tiền, tức gia <= j)
      // => còn j-gia tiền cho i-1 cuốn đầu, cộng thêm số trang của cuốn i
      // => nếu được nhiều trang hơn lựa chọn 1 thì chọn mua
      if (gia <= j && m[i - 1][j - gia] + trang > m[i][j]) {
        m[i][j] = m[i - 1][j - gia] + trang;
      }
    }
  }

  // Bước 3: m[n][x] là đáp án
  return m;
}

/**
 * Truy vết các cuốn sách được mua từ bảng m.
 * @param {number[][]} m - bảng đã điền bởi DienBang
 * @param {number[]} h - giá các cuốn sách (h[0] là giá cuốn 1)
 * @param {number} n - số cuốn sách
 * @param {number} x - số tiền tối đa
 * @returns {number[]} kq - chỉ số các cuốn được mua (đánh số từ 1), tăng dần
 */
export function TruyVet(m, h, n, x) {
  let j = x;
  const kq = []; // mảng rỗng

  for (let i = n; i >= 1; i--) {      // Đi ngược từ cuốn n về cuốn 1
    if (m[i][j] !== m[i - 1][j]) {     // Khác ô phía trên => có mua cuốn i
      kq.push(i);                      // Thêm i vào cuối mảng kq
      j = j - h[i - 1];                // Trừ tiền đã mua cuốn i
    }
    // Bằng ô phía trên => không mua cuốn i, giữ nguyên j
  }

  kq.reverse(); // Đảo ngược để các cuốn theo thứ tự tăng dần
  return kq;
}