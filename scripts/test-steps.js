// Chạy: node scripts/test-steps.js
import { TaoCacBuoc, TruyVet } from '../src/algorithms/knapsack.js';

const check = (name, ok) => console.log(`${ok ? 'ĐÚNG' : 'SAI '} | ${name}`);

// Ví dụ 1 (Wecode)
const h = [4, 8, 5, 3], s = [5, 12, 8, 1], n = 4, x = 10;
const { m, steps } = TaoCacBuoc(h, s, n, x);

check('Tổng số bước = n*x + n + 2 = 46', steps.length === 46);
check('steps[0] là bước khởi tạo', steps[0].phase === 'init');

const o = steps[1 + (3 - 1) * x + (9 - 1)]; // ô m[3][9] ở bước 29
check('steps[29] là ô m[3][9], mua, value 13',
  o.phase === 'fill' && o.i === 3 && o.j === 9 && o.luaChon === 'mua' && o.value === 13 &&
  o.oTren.value === 12 && o.oTrai.j === 4 && o.oTrai.value === 5 && o.giaTriMua === 13);
console.log('       ', o.message);

// Mọi bước 'fill' khớp đúng ô của bảng m
let khop = true;
for (let i = 1; i <= n; i++) for (let j = 1; j <= x; j++) {
  const b = steps[1 + (i - 1) * x + (j - 1)];
  if (b.i !== i || b.j !== j || b.value !== m[i][j]) khop = false;
}
check('Mọi bước fill khớp vị trí và giá trị với bảng m', khop);

// Các bước truy vết khớp Bảng 2.4
const trace = steps.filter(b => b.phase === 'trace');
const mong = [
  { i: 4, j: 10, mua: false, jSau: 10, kq: '' },
  { i: 3, j: 10, mua: true, jSau: 5, kq: '3' },
  { i: 2, j: 5, mua: false, jSau: 5, kq: '3' },
  { i: 1, j: 5, mua: true, jSau: 1, kq: '3,1' },
];
check('4 bước truy vết khớp Bảng 2.4', trace.length === 4 && trace.every((b, k) =>
  b.i === mong[k].i && b.j === mong[k].j && b.mua === mong[k].mua &&
  b.jSau === mong[k].jSau && b.kq.join(',') === mong[k].kq));
trace.forEach(b => console.log('       ', b.message));

const done = steps[steps.length - 1];
check('Bước cuối: đáp án 13, kq = [1, 3], khớp TruyVet',
  done.phase === 'done' && done.dapAn === 13 &&
  done.kq.join(' ') === TruyVet(m, h, n, x).join(' '));
console.log('       ', done.message);