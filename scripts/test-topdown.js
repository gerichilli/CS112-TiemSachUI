// Chạy: node scripts/test-topdown.js
import { DienBang, TaoCacBuocTopDown } from '../src/algorithms/knapsack.js';

const check = (name, ok) => console.log(`${ok ? 'ĐÚNG' : 'SAI '} | ${name}`);

// Ví dụ Wecode: so với Bảng 2.6 và 2.7
const r = TaoCacBuocTopDown([4, 8, 5, 3], [5, 12, 8, 1], 4, 10);
check('Đáp án MF(4, 10) = 13', r.value === 13);
check('Tính đúng 11/40 ô (Bảng 2.6)', r.computed === 11);
check('Lấy lại 1 lần', r.reused === 1);
const order = r.steps.filter((b) => b.phase === 'compute').map((b) => `m[${b.i}][${b.j}]`).join(' ');
const expect = 'm[1][10] m[1][2] m[2][10] m[1][5] m[2][5] m[3][10] m[1][7] m[2][7] m[2][2] m[3][7] m[4][10]';
check('Thứ tự tính các ô khớp Bảng 2.7', order === expect);
console.log('        ', order);
const re = r.steps.find((b) => b.phase === 'reuse');
check('Ô được lấy lại là m[1][2]', re && re.i === 1 && re.j === 2);
console.log('        ', re.message);

// Ngẫu nhiên: so với bottom-up
let ok = true;
let seed = 42;
const rnd = (a, b) => { seed = (seed * 1103515245 + 12345) % 2147483648; return a + (seed % (b - a + 1)); };
for (let t = 0; t < 300; t++) {
  const n = rnd(1, 30), x = rnd(1, 60);
  const h = Array.from({ length: n }, () => rnd(1, 30));
  const s = Array.from({ length: n }, () => rnd(1, 50));
  const m = DienBang(h, s, n, x);
  const td = TaoCacBuocTopDown(h, s, n, x);
  if (td.value !== m[n][x]) ok = false;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= x; j++) {
    if (td.mf[i][j] >= 0 && td.mf[i][j] !== m[i][j]) ok = false; // ô nào tính được phải khớp bottom-up
  }
}
check('300 bộ dữ liệu ngẫu nhiên: top-down cho cùng kết quả với bottom-up', ok);
