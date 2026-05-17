export function lowerBound(prefix: number[], x: number): number {
  // returns smallest i such that prefix[i] >= x
  let lo = 0,
    hi = prefix.length - 1,
    ans = prefix.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (prefix[mid] >= x) {
      ans = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return ans;
}

// ---------- helpers (new structure) ----------
export const makePrefix = (nums: number[]) => {
  const out = new Array(nums.length + 1);
  out[0] = 0;
  for (let i = 0; i < nums.length; i++) out[i + 1] = out[i] + nums[i];
  return out;
};

// lower bound: first idx i with arr[i] >= target
export const lb = (arr: number[], target: number) => {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
