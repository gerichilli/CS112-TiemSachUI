// Chạy toàn bộ bộ testcase trong tests/ và kiểm tra kết quả
// Chạy: node scripts/run-tests.js
// Kết quả chi tiết ghi vào tests/ket-qua.csv
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { DienBang, TruyVet } from '../src/algorithms/knapsack.js';
import { VetCan } from '../src/algorithms/bruteforce.js';
import { parseInputText, WECODE_LIMITS } from '../src/algorithms/parseInput.js';

const ROOT = path.resolve('tests');

// ---- Các cách kiểm chứng chéo (cài đặt độc lập với DienBang) ----

// Đệ quy có nhớ, chỉ tính giá trị (dùng khi n*x không quá lớn)
function deQuyCoNho(h, s, n, x) {
  const memo = Array.from({ length: n + 1 }, () => new Map());
  function MF(i, j) {
    if (i === 0 || j === 0) return 0;
    const c = memo[i].get(j);
    if (c !== undefined) return c;
    let v = MF(i - 1, j);
    if (h[i - 1] <= j) v = Math.max(v, MF(i - 1, j - h[i - 1]) + s[i - 1]);
    memo[i].set(j, v);
    return v;
  }
  return MF(n, x);
}

// Quy hoạch động cài đặt lại bằng một mảng 1 chiều, duyệt tiền từ x giảm dần
function qhdMotChieu(h, s, n, x) {
  const f = new Array(x + 1).fill(0);
  for (let i = 0; i < n; i++) for (let j = x; j >= h[i]; j--) f[j] = Math.max(f[j], f[j - h[i]] + s[i]);
  return f[x];
}

// Kiểm tra phương án truy vết có hợp lệ không
function kiemTraTruyVet(kq, h, s, n, x, dapAn) {
  for (let k = 0; k < kq.length; k++) {
    if (!Number.isInteger(kq[k]) || kq[k] < 1 || kq[k] > n) return 'chỉ số ngoài 1..n';
    if (k > 0 && kq[k] <= kq[k - 1]) return 'không tăng dần hoặc bị trùng';
  }
  const tongGia = kq.reduce((a, i) => a + h[i - 1], 0);
  const tongTrang = kq.reduce((a, i) => a + s[i - 1], 0);
  if (tongGia > x) return `tổng giá ${tongGia} > x`;
  if (tongTrang !== dapAn) return `tổng số trang ${tongTrang} ≠ đáp án ${dapAn}`;
  return 'hợp lệ';
}

// ---- Chạy từng test ----
const rows = [];
const nhoms = fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory()).sort();

for (const nhom of nhoms) {
  const files = fs.readdirSync(path.join(ROOT, nhom)).filter((f) => f.endsWith('.inp')).sort();
  for (const f of files) {
    const ten = f.replace('.inp', '');
    const text = fs.readFileSync(path.join(ROOT, nhom, f), 'utf8');
    const parsed = parseInputText(text, WECODE_LIMITS);

    // Nhóm dữ liệu không hợp lệ: đạt nếu chương trình đọc file báo lỗi
    if (nhom === '07-khong-hop-le') {
      rows.push({ nhom, ten, ketQua: parsed.error ? 'ĐẠT' : 'KHÔNG ĐẠT', ghiChu: parsed.error || 'không báo lỗi' });
      continue;
    }
    if (parsed.error) { rows.push({ nhom, ten, ketQua: 'KHÔNG ĐẠT', ghiChu: 'đọc file lỗi: ' + parsed.error }); continue; }

    const { n, x, h, s } = parsed.data;
    const [mongDoi, , dongBa] = fs.readFileSync(path.join(ROOT, nhom, ten + '.out'), 'utf8').split('\n');

    const t0 = performance.now();
    const m = DienBang(h, s, n, x);
    const kq = TruyVet(m, h, n, x);
    const ms = performance.now() - t0;
    const dapAn = m[n][x];

    const dongMot = dapAn === Number(mongDoi);
    const truyVet = kiemTraTruyVet(kq, h, s, n, x, dapAn);
    const vetCan = n <= 20 ? (VetCan(h, s, n, x).best === dapAn ? 'khớp' : 'LỆCH') : '—';
    const deQuy = n * x <= 2e6 ? (deQuyCoNho(h, s, n, x) === dapAn ? 'khớp' : 'LỆCH') : '—';
    const motChieu = qhdMotChieu(h, s, n, x) === dapAn ? 'khớp' : 'LỆCH';
    const trungPhuongAn = kq.join(' ') === (dongBa || '').trim() ? 'có' : 'không';

    const dat = dongMot && truyVet === 'hợp lệ' && vetCan !== 'LỆCH' && deQuy !== 'LỆCH' && motChieu === 'khớp';
    rows.push({ nhom, ten, n, x, dapAn, mongDoi: Number(mongDoi), dongMot, truyVet, vetCan, deQuy, motChieu, trungPhuongAn, ms, ketQua: dat ? 'ĐẠT' : 'KHÔNG ĐẠT' });
  }
}

// ---- Tổng hợp theo nhóm ----
console.log('Nhóm                 | Số test | Đạt | Thời gian lớn nhất (ms)');
console.log('---------------------|---------|-----|------------------------');
for (const nhom of nhoms) {
  const r = rows.filter((v) => v.nhom === nhom);
  const dat = r.filter((v) => v.ketQua === 'ĐẠT').length;
  const maxMs = Math.max(0, ...r.map((v) => v.ms || 0));
  console.log(`${nhom.padEnd(21)}| ${String(r.length).padStart(7)} | ${String(dat).padStart(3)} | ${nhom === '07-khong-hop-le' ? '—' : maxMs.toFixed(1)}`);
}
const tongDat = rows.filter((v) => v.ketQua === 'ĐẠT').length;
console.log(`\nTổng: ${tongDat}/${rows.length} test đạt`);
rows.filter((v) => v.ketQua !== 'ĐẠT').forEach((v) => console.log('KHÔNG ĐẠT:', v.nhom, v.ten, v.ghiChu || v.truyVet));

// ---- Ghi chi tiết ra CSV ----
const head = 'nhom,ten,n,x,dap_an,mong_doi,dung_dong_1,truy_vet,vet_can,de_quy_co_nho,qhd_1_chieu,trung_phuong_an_mau,thoi_gian_ms,ket_qua,ghi_chu';
const lines = rows.map((v) => [v.nhom, v.ten, v.n ?? '', v.x ?? '', v.dapAn ?? '', v.mongDoi ?? '', v.dongMot ?? '',
  v.truyVet ?? '', v.vetCan ?? '', v.deQuy ?? '', v.motChieu ?? '', v.trungPhuongAn ?? '',
  v.ms !== undefined ? v.ms.toFixed(2) : '', v.ketQua, v.ghiChu ?? ''].map((c) => `"${c}"`).join(','));
fs.writeFileSync(path.join(ROOT, 'ket-qua.csv'), '\uFEFF' + [head, ...lines].join('\n') + '\n');
console.log(`Chi tiết: ${path.join('tests', 'ket-qua.csv')}`);
