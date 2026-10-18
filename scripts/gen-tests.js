// Sinh bộ testcase vào thư mục tests/
// Chạy: node scripts/gen-tests.js
// Mỗi test gồm file .inp (định dạng đề Wecode) và .out (Output 3 dòng của đề mở rộng).
// Đáp án .out được tạo như sau:
//   - nhóm 01-mau: lấy từ báo cáo (Bảng 2.1) và tài liệu Levitin, ghi tay
//   - test có n <= 20: lấy từ vét cạn (độc lập với quy hoạch động)
//   - test còn lại: lấy từ quy hoạch động (DienBang + TruyVet)
import fs from 'node:fs';
import path from 'node:path';
import { DienBang, TruyVet } from '../src/algorithms/knapsack.js';
import { VetCan } from '../src/algorithms/bruteforce.js';

const ROOT = path.resolve('tests');

// Bộ sinh số ngẫu nhiên có hạt giống, để chạy lại luôn ra cùng một bộ test
let seed = 20261018;
const rnd = (a, b) => { seed = (seed * 1103515245 + 12345) % 2147483648; return a + (seed % (b - a + 1)); };
const arr = (n, a, b) => Array.from({ length: n }, () => rnd(a, b));

const danhSach = []; // dòng cho file danh-sach.csv

function ghiTest(nhom, ten, moTa, n, x, h, s, dapAnTay = null) {
  const dir = path.join(ROOT, nhom);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, ten + '.inp'), `${n} ${x}\n${h.join(' ')}\n${s.join(' ')}\n`);

  let best, kq, nguon;
  if (dapAnTay) { [best, kq] = dapAnTay; nguon = 'tính tay'; }
  else if (n <= 20) { ({ best, kq } = VetCan(h, s, n, x)); nguon = 'vét cạn'; }
  else { const m = DienBang(h, s, n, x); best = m[n][x]; kq = TruyVet(m, h, n, x); nguon = 'quy hoạch động'; }

  fs.writeFileSync(path.join(dir, ten + '.out'), `${best}\n${kq.length}\n${kq.join(' ')}\n`);
  danhSach.push([nhom, ten, n, x, nguon, moTa]);
}

function ghiTestLoi(ten, moTa, noiDung) {
  const dir = path.join(ROOT, '07-khong-hop-le');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, ten + '.inp'), noiDung);
  danhSach.push(['07-khong-hop-le', ten, '', '', 'phải báo lỗi', moTa]);
}

fs.rmSync(ROOT, { recursive: true, force: true });

// ===== 01. Ví dụ mẫu (đáp án có sẵn, ghi tay) =====
ghiTest('01-mau', 'vd1-wecode', 'Ví dụ 1, Bảng 2.1 (đề Wecode)', 4, 10, [4, 8, 5, 3], [5, 12, 8, 1], [13, [1, 3]]);
ghiTest('01-mau', 'vd2-khong-du-tien', 'Ví dụ 2, Bảng 2.1', 3, 2, [3, 5, 4], [10, 20, 15], [0, []]);
ghiTest('01-mau', 'vd3-mua-het', 'Ví dụ 3, Bảng 2.1', 3, 100, [10, 20, 30], [1, 2, 3], [6, [1, 2, 3]]);
ghiTest('01-mau', 'vd4-ti-le-cao-nhat-sai', 'Ví dụ 4, Bảng 2.1', 3, 10, [6, 5, 5], [9, 7, 7], [14, [2, 3]]);
ghiTest('01-mau', 'levitin-vidu1', 'Levitin, Example 1 mục 8.2 (đáp án 37)', 4, 5, [2, 1, 3, 2], [12, 10, 20, 15], [37, [1, 2, 4]]);
ghiTest('01-mau', 'levitin-baitap1a', 'Levitin, Bài tập 8.2.1a', 5, 6, [3, 2, 1, 4, 5], [25, 20, 15, 40, 50], [65, [3, 5]]);

// ===== 02. Nhỏ, ngẫu nhiên (n <= 20, đáp án từ vét cạn) =====
for (let t = 1; t <= 40; t++) {
  const n = rnd(1, 20), x = rnd(1, 100);
  ghiTest('02-nho-ngau-nhien', `nho-${String(t).padStart(2, '0')}`, 'Ngẫu nhiên n ≤ 20, x ≤ 100', n, x, arr(n, 1, 50), arr(n, 1, 100));
}

// ===== 03. Biên =====
ghiTest('03-bien', 'b01-nhonhat', 'n = 1, x = 1, h = s = 1: mua được', 1, 1, [1], [1]);
ghiTest('03-bien', 'b02-mot-cuon-dat', 'n = 1, giá lớn hơn x: không mua', 1, 5, [6], [100]);
ghiTest('03-bien', 'b03-gia-bang-x', 'n = 1, giá đúng bằng x', 1, 7, [7], [42]);
ghiTest('03-bien', 'b04-x-nho-hon-moi-gia', 'x nhỏ hơn giá mọi cuốn: đáp án 0', 10, 4, arr(10, 5, 50), arr(10, 1, 100));
{ const h = arr(10, 1, 50); const sum = h.reduce((a, b) => a + b, 0);
  ghiTest('03-bien', 'b05-x-lon-hon-tong-gia', 'x lớn hơn tổng giá: mua hết', 10, sum + 13, h, arr(10, 1, 100));
  ghiTest('03-bien', 'b06-x-bang-tong-gia', 'x đúng bằng tổng giá: mua hết', 10, sum, h, arr(10, 1, 100)); }
ghiTest('03-bien', 'b07-gia-trang-toi-da', 'h = s = 1000 (giá trị lớn nhất), x = 1000', 5, 1000, Array(5).fill(1000), Array(5).fill(1000));
{ const h = Array(1000).fill(2); const k = rnd(0, 999); h[k] = 1;
  ghiTest('03-bien', 'b08-x-bang-1', 'n = 1000, x = 1, chỉ một cuốn giá 1', 1000, 1, h, arr(1000, 1, 1000)); }
ghiTest('03-bien', 'b09-moi-gia-bang-1', 'n = 1000, x = 100000, mọi giá = 1: mua hết', 1000, 100000, Array(1000).fill(1), arr(1000, 1, 1000));
ghiTest('03-bien', 'b10-moi-gia-1000', 'n = 1000, x = 100000, h = s = 1000: mua đúng 100 cuốn', 1000, 100000, Array(1000).fill(1000), Array(1000).fill(1000));
ghiTest('03-bien', 'b11-x-toi-da-1-cuon', 'n = 1, x = 100000', 1, 100000, [1000], [1000]);
ghiTest('03-bien', 'b12-khong-mua-duoc', 'n = 1000, x = 1, mọi giá = 1000: đáp án 0', 1000, 1, Array(1000).fill(1000), arr(1000, 1, 1000));

// ===== 04. Đặc biệt =====
ghiTest('04-dac-biet', 'd01-ti-le-cao-nhat-sai', 'Chọn cuốn nhiều trang/giá nhất trước sẽ sai', 5, 20, [11, 10, 10, 6, 4], [23, 20, 20, 5, 3]);
ghiTest('04-dac-biet', 'd02-cung-gia', 'Mọi cuốn cùng giá: chọn các cuốn nhiều trang nhất', 15, 23, Array(15).fill(5), arr(15, 1, 100));
ghiTest('04-dac-biet', 'd03-cung-so-trang', 'Mọi cuốn cùng số trang: mua được càng nhiều cuốn càng tốt', 15, 40, arr(15, 1, 20), Array(15).fill(7));
ghiTest('04-dac-biet', 'd04-sach-giong-nhau', 'Các cuốn giống hệt nhau: nhiều phương án tối ưu', 3, 6, [3, 3, 3], [5, 5, 5]);
ghiTest('04-dac-biet', 'd05-nhieu-phuong-an', 'Mua {1, 2} hay {3} đều được 5 trang', 3, 5, [2, 3, 5], [2, 3, 5]);
{ const h = arr(20, 1, 30); ghiTest('04-dac-biet', 'd06-gia-bang-so-trang', 'Số trang bằng giá: nhiều phương án tối ưu', 20, 50, h, [...h]); }
ghiTest('04-dac-biet', 'd07-cuon-qua-dat', 'Có cuốn nhiều trang nhất nhưng giá lớn hơn x', 6, 15, [16, 5, 4, 6, 3, 9], [1000, 8, 6, 9, 4, 12]);
ghiTest('04-dac-biet', 'd08-mot-cuon-vs-ket-hop', 'Một cuốn giá bằng x so với kết hợp nhiều cuốn rẻ', 4, 10, [10, 4, 3, 3], [15, 6, 5, 5]);

// ===== 05. Trung bình (n 50..200, x 1000..10000) =====
for (let t = 1; t <= 10; t++) {
  const n = rnd(50, 200), x = rnd(1000, 10000);
  ghiTest('05-trung-binh', `tb-${String(t).padStart(2, '0')}`, 'Ngẫu nhiên n ≤ 200, x ≤ 10000', n, x, arr(n, 1, 1000), arr(n, 1, 1000));
}

// ===== 06. Lớn (n = 1000, x = 100000, đúng ràng buộc lớn nhất) =====
ghiTest('06-lon', 'lon-01-ngau-nhien', 'Giá, số trang ngẫu nhiên 1..1000', 1000, 100000, arr(1000, 1, 1000), arr(1000, 1, 1000));
ghiTest('06-lon', 'lon-02-gia-nho', 'Giá nhỏ 1..100 (mua được nhiều cuốn)', 1000, 100000, arr(1000, 1, 100), arr(1000, 1, 1000));
ghiTest('06-lon', 'lon-03-gia-lon', 'Giá lớn 500..1000', 1000, 100000, arr(1000, 500, 1000), arr(1000, 1, 1000));
{ const h = arr(1000, 1, 1000); ghiTest('06-lon', 'lon-04-trang-theo-gia', 'Số trang gần bằng giá (khó phân biệt)', 1000, 100000, h, h.map((v) => Math.min(1000, v + rnd(0, 5)))); }
ghiTest('06-lon', 'lon-05-x-nho', 'n = 1000 nhưng x = 500', 1000, 500, arr(1000, 1, 1000), arr(1000, 1, 1000));

// ===== 07. Không hợp lệ (chương trình đọc file phải báo lỗi) =====
ghiTestLoi('e01-file-rong', 'File rỗng', '');
ghiTestLoi('e02-thieu-so', 'Thiếu một số trang', '4 10\n4 8 5 3\n5 12 8\n');
ghiTestLoi('e03-thua-so', 'Thừa một số', '4 10\n4 8 5 3\n5 12 8 1 9\n');
ghiTestLoi('e04-chu-cai', 'Có chữ cái', '4 10\n4 8 a 3\n5 12 8 1\n');
ghiTestLoi('e05-so-thuc', 'Có số thực', '2 10\n2.5 3\n4 5\n');
ghiTestLoi('e06-so-am', 'Giá âm', '2 10\n-3 4\n5 6\n');
ghiTestLoi('e07-n-bang-0', 'n = 0', '0 10\n\n\n');
ghiTestLoi('e08-n-qua-lon', 'n = 1001', `1001 10\n${Array(1001).fill(1).join(' ')}\n${Array(1001).fill(1).join(' ')}\n`);
ghiTestLoi('e09-x-bang-0', 'x = 0', '1 0\n1\n1\n');
ghiTestLoi('e10-x-qua-lon', 'x = 100001', '1 100001\n1\n1\n');
ghiTestLoi('e11-gia-bang-0', 'Giá bằng 0', '2 10\n0 4\n5 6\n');
ghiTestLoi('e12-trang-qua-lon', 'Số trang 1001', '2 10\n3 4\n5 1001\n');

// Danh sách test
const csv = ['nhom,ten,n,x,nguon_dap_an,mo_ta', ...danhSach.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
fs.writeFileSync(path.join(ROOT, 'danh-sach.csv'), '\uFEFF' + csv + '\n');
console.log(`Đã sinh ${danhSach.length} test vào ${ROOT}`);
