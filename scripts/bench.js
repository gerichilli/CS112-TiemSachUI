// Đo thời gian chạy theo kích thước dữ liệu (mục 6.2 của báo cáo)
// Chạy: node scripts/bench.js
import { performance } from 'node:perf_hooks';
import { DienBang, TruyVet } from '../src/algorithms/knapsack.js';
import { VetCan } from '../src/algorithms/bruteforce.js';

let seed = 20261018;
const rnd = (a, b) => { seed = (seed * 1103515245 + 12345) % 2147483648; return a + Math.floor(seed / 65536) % (b - a + 1); };
const arr = (n, a, b) => Array.from({ length: n }, () => rnd(a, b));

// Đệ quy có nhớ chỉ tính giá trị (không ghi bước), dùng bảng như mục 2.6
function topDown(h, s, n, x) {
  const mf = Array.from({ length: n + 1 }, () => new Int32Array(x + 1).fill(-1));
  for (let j = 0; j <= x; j++) mf[0][j] = 0;
  for (let i = 0; i <= n; i++) mf[i][0] = 0;
  const MF = (i, j) => {
    if (mf[i][j] >= 0) return mf[i][j];
    let v = MF(i - 1, j);
    if (h[i - 1] <= j) v = Math.max(v, MF(i - 1, j - h[i - 1]) + s[i - 1]);
    return (mf[i][j] = v);
  };
  return MF(n, x);
}
function motChieu(h, s, n, x) {
  const f = new Int32Array(x + 1);
  for (let i = 0; i < n; i++) for (let j = x; j >= h[i]; j--) f[j] = Math.max(f[j], f[j - h[i]] + s[i]);
  return f[x];
}
const time = (fn, rep) => {
  const t = [];
  for (let r = 0; r < rep; r++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); }
  return t.sort((a, b) => a - b)[Math.floor(t.length / 2)]; // trung vị
};

console.log('n,x,n*x,vet_can_ms,bottom_up_ms,top_down_ms,mot_chieu_ms');
for (const [n, x] of [[10, 100], [15, 100], [20, 100], [50, 1000], [100, 1000], [200, 10000], [500, 50000], [1000, 100000]]) {
  const h = arr(n, 1, 1000), s = arr(n, 1, 1000);
  const rep = n * x <= 1e6 ? 15 : 5;
  const vc = n <= 20 ? time(() => VetCan(h, s, n, x), 5).toFixed(2) : '';
  const bu = time(() => { const m = DienBang(h, s, n, x); TruyVet(m, h, n, x); }, rep).toFixed(2);
  const td = n * x <= 5e7 ? time(() => topDown(h, s, n, x), rep).toFixed(2) : '';
  const oc = time(() => motChieu(h, s, n, x), rep).toFixed(2);
  console.log([n, x, n * x, vc, bu, td, oc].join(','));
}
