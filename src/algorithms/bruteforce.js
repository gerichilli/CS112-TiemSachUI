// Vét cạn: thử tất cả 2^n cách chọn sách (mục 5.1).
// Chỉ dùng để kiểm chứng với n nhỏ (n <= 20).
// @returns {{ best: number, kq: number[] }} - kq: một phương án tối ưu, chỉ số từ 1, tăng dần
export function VetCan(h, s, n, x) {
  let best = 0;
  let bestMask = 0;
  for (let mask = 0; mask < (1 << n); mask++) {   // mỗi mask là một tập con
    let tongGia = 0, tongTrang = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) { tongGia += h[i]; tongTrang += s[i]; }
    }
    if (tongGia <= x && tongTrang > best) { best = tongTrang; bestMask = mask; }
  }
  const kq = [];
  for (let i = 0; i < n; i++) if (bestMask & (1 << i)) kq.push(i + 1);
  return { best, kq };
}
