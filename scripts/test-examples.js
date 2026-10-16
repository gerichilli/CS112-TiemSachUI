import { DienBang, TruyVet } from '../src/algorithms/knapsack.js';
 
const examples = [
  { name: 'Ví dụ 1', n: 4, x: 10, h: [4, 8, 5, 3], s: [5, 12, 8, 1], expect: [13, [1, 3]] },
  { name: 'Ví dụ 2', n: 3, x: 2, h: [3, 5, 4], s: [10, 20, 15], expect: [0, []] },
  { name: 'Ví dụ 3', n: 3, x: 100, h: [10, 20, 30], s: [1, 2, 3], expect: [6, [1, 2, 3]] },
  { name: 'Ví dụ 4', n: 3, x: 10, h: [6, 5, 5], s: [9, 7, 7], expect: [14, [2, 3]] },
];
 
for (const ex of examples) {
  const m = DienBang(ex.h, ex.s, ex.n, ex.x);
  const kq = TruyVet(m, ex.h, ex.n, ex.x);
  const output = `${m[ex.n][ex.x]}\n${kq.length}\n${kq.join(' ')}`;
  const ok = m[ex.n][ex.x] === ex.expect[0] && kq.join(' ') === ex.expect[1].join(' ');
  console.log(`=== ${ex.name}: ${ok ? 'ĐÚNG' : 'SAI'} ===`);
  console.log(output);
  if (ex.name === 'Ví dụ 1') console.table(m); // đối chiếu với Bảng 2.3
}
 