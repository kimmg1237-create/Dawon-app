export type NormBox = [number, number, number, number]

function luminance(r: number, g: number, b: number) {
  return r * 0.3 + g * 0.59 + b * 0.11
}

function smooth(profile: Float32Array, win = 7) {
  const out = new Float32Array(profile.length)
  for (let i = 0; i < profile.length; i++) {
    let sum = 0
    let n = 0
    for (let k = -win; k <= win; k++) {
      const j = i + k
      if (j >= 0 && j < profile.length) {
        sum += profile[j]
        n += 1
      }
    }
    out[i] = sum / n
  }
  return out
}

function inkProfiles(image: HTMLCanvasElement) {
  const ctx = image.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  const w = image.width
  const h = image.height
  const { data } = ctx.getImageData(0, 0, w, h)
  const cols = new Float32Array(w)
  const rows = new Float32Array(h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const ink = luminance(data[i], data[i + 1], data[i + 2]) < 214 ? 1 : 0
      cols[x] += ink
      rows[y] += ink
    }
  }
  for (let x = 0; x < w; x++) cols[x] /= h
  for (let y = 0; y < h; y++) rows[y] /= w
  return { cols: smooth(cols), rows: smooth(rows), w, h }
}

function contentSpan(profile: Float32Array, min = 0.045) {
  let a = 0
  let b = profile.length - 1
  while (a < b && profile[a] < min) a += 1
  while (b > a && profile[b] < min) b -= 1
  const pad = Math.floor((b - a) * 0.012)
  return [Math.max(0, a - pad), Math.min(profile.length - 1, b + pad)] as const
}

function findValleys(profile: Float32Array, count: number, from: number, to: number) {
  const span = Math.max(8, to - from)
  const minDist = Math.floor(span / (count + 2.2))
  const candidates: { i: number; v: number }[] = []
  for (let i = from + minDist; i < to - minDist; i++) {
    if (profile[i] <= profile[i - 1] && profile[i] <= profile[i + 1]) {
      candidates.push({ i, v: profile[i] })
    }
  }
  candidates.sort((a, b) => a.v - b.v)
  const picked: number[] = []
  for (const item of candidates) {
    if (picked.every((p) => Math.abs(p - item.i) >= minDist)) {
      picked.push(item.i)
      if (picked.length === count) break
    }
  }
  return picked.sort((a, b) => a - b)
}

function insetBox(x0: number, y0: number, x1: number, y1: number, t = 0.012): NormBox {
  const dx = (x1 - x0) * t
  const dy = (y1 - y0) * t
  return [
    Math.max(0, x0 + dx),
    Math.max(0, y0 + dy),
    Math.min(1, x1 - dx),
    Math.min(1, y1 - dy),
  ]
}

function gridBoxes(
  xs: number[],
  y0: number,
  y1: number,
  w: number,
  h: number,
): NormBox[] {
  const boxes: NormBox[] = []
  for (let i = 0; i < xs.length - 1; i++) {
    boxes.push(insetBox(xs[i] / w, y0 / h, xs[i + 1] / w, y1 / h))
  }
  return boxes
}

const FALLBACK_4: NormBox[] = [
  [0.05, 0.12, 0.495, 0.51],
  [0.505, 0.12, 0.95, 0.51],
  [0.05, 0.52, 0.495, 0.9],
  [0.505, 0.52, 0.95, 0.9],
]

const FALLBACK_7: NormBox[] = [
  [0.05, 0.1, 0.35, 0.38],
  [0.36, 0.1, 0.66, 0.38],
  [0.67, 0.1, 0.95, 0.38],
  [0.05, 0.4, 0.495, 0.64],
  [0.505, 0.4, 0.95, 0.64],
  [0.05, 0.66, 0.495, 0.91],
  [0.505, 0.66, 0.95, 0.91],
]

export function detectComicPanels(image: HTMLCanvasElement, wanted: 4 | 7): NormBox[] {
  const profiles = inkProfiles(image)
  if (!profiles) return wanted === 4 ? FALLBACK_4 : FALLBACK_7
  const { cols, rows, w, h } = profiles
  const [xA, xB] = contentSpan(cols)
  const [yA, yB] = contentSpan(rows)
  if (xB - xA < w * 0.45 || yB - yA < h * 0.45) {
    return wanted === 4 ? FALLBACK_4 : FALLBACK_7
  }

  if (wanted === 4) {
    const v = findValleys(cols, 1, xA, xB)
    const hz = findValleys(rows, 1, yA, yB)
    if (v.length === 1 && hz.length === 1) {
      const xs = [xA, v[0], xB]
      const ys = [yA, hz[0], yB]
      return [
        insetBox(xs[0] / w, ys[0] / h, xs[1] / w, ys[1] / h),
        insetBox(xs[1] / w, ys[0] / h, xs[2] / w, ys[1] / h),
        insetBox(xs[0] / w, ys[1] / h, xs[1] / w, ys[2] / h),
        insetBox(xs[1] / w, ys[1] / h, xs[2] / w, ys[2] / h),
      ]
    }
    return FALLBACK_4.map((b) =>
      insetBox(
        xA / w + b[0] * ((xB - xA) / w),
        yA / h + b[1] * ((yB - yA) / h),
        xA / w + b[2] * ((xB - xA) / w),
        yA / h + b[3] * ((yB - yA) / h),
        0,
      ),
    )
  }

  const hs = findValleys(rows, 2, yA, yB)
  const yCuts = hs.length === 2 ? [yA, hs[0], hs[1], yB] : [yA, yA + (yB - yA) / 3, yA + (2 * (yB - yA)) / 3, yB]
  const rowSplits = [2, 1, 1]
  const boxes: NormBox[] = []
  for (let r = 0; r < 3; r++) {
    const vs = findValleys(cols, rowSplits[r], xA, xB)
    const xs =
      vs.length === rowSplits[r]
        ? [xA, ...vs, xB]
        : rowSplits[r] === 2
          ? [xA, xA + (xB - xA) / 3, xA + (2 * (xB - xA)) / 3, xB]
          : [xA, (xA + xB) / 2, xB]
    boxes.push(...gridBoxes(xs, yCuts[r], yCuts[r + 1], w, h))
  }
  return boxes.length === 7 ? boxes : FALLBACK_7
}
