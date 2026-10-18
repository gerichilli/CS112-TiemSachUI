// Đọc dữ liệu theo đúng định dạng đề Wecode:
//   dòng 1: n x
//   dòng 2: n số h[i] (giá)
//   dòng 3: n số s[i] (số trang)
// Các số chỉ cần cách nhau bởi khoảng trắng hoặc xuống dòng.

// Giới hạn của đề Wecode (dùng cho bộ testcase)
export const WECODE_LIMITS = { nMax: 1000, xMax: 100000, hsMax: 1000 };
// Giới hạn của giao diện minh họa (mục 4.2)
export const UI_LIMITS = { nMax: 100, xMax: 100, hsMax: 1000 };

/**
 * @param {string} text - nội dung file
 * @param {{nMax:number, xMax:number, hsMax:number}} limits
 * @returns {{ data?: {n:number, x:number, h:number[], s:number[]}, error?: string }}
 */
export function parseInputText(text, limits = UI_LIMITS) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return { error: 'File phải có ít nhất 2 số n và x ở dòng đầu.' };
  if (!tokens.every((t) => /^-?\d+$/.test(t))) return { error: 'File chỉ được chứa số nguyên.' };
  const nums = tokens.map(Number);
  const [n, x] = nums;
  if (n < 1 || n > limits.nMax) return { error: `n = ${n} nằm ngoài giới hạn (1 ≤ n ≤ ${limits.nMax}).` };
  if (x < 1 || x > limits.xMax) return { error: `x = ${x} nằm ngoài giới hạn (1 ≤ x ≤ ${limits.xMax}).` };
  const need = 2 + 2 * n;
  if (nums.length < need) return { error: `Với n = ${n}, file cần ${need} số nhưng chỉ có ${nums.length}.` };
  if (nums.length > need) return { error: `Với n = ${n}, file cần ${need} số nhưng có tới ${nums.length}.` };
  const h = nums.slice(2, 2 + n);
  const s = nums.slice(2 + n);
  const badH = h.findIndex((v) => v < 1 || v > limits.hsMax);
  if (badH >= 0) return { error: `Giá cuốn ${badH + 1} là ${h[badH]}, nằm ngoài giới hạn (1 ≤ h[i] ≤ ${limits.hsMax}).` };
  const badS = s.findIndex((v) => v < 1 || v > limits.hsMax);
  if (badS >= 0) return { error: `Số trang cuốn ${badS + 1} là ${s[badS]}, nằm ngoài giới hạn (1 ≤ s[i] ≤ ${limits.hsMax}).` };
  return { data: { n, x, h, s } };
}
