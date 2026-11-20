/**
 * FrameStore — progressive loader + bounded decode cache for the hero sequence.
 *
 * Memory: a decoded 1280×720 frame is ~3.7 MB, so holding all 190 decoded
 * would cost ~700 MB. Instead we keep every frame as a compressed Blob
 * (~100 KB each) and only a bounded set of decoded ImageBitmaps:
 *   - "anchor" frames spread across the sequence that stay decoded, so there is
 *     always a nearby frame to show however fast someone scrolls;
 *   - an LRU window around the current position, biased in the scroll direction.
 * If the exact frame isn't decoded yet, `nearest()` returns the closest one —
 * the canvas never waits, so scrubbing never stalls.
 */

type Drawable = ImageBitmap | HTMLImageElement;

const FETCH_CONCURRENCY = 6;

export class FrameStore {
  readonly count: number;
  private urls: string[];
  private blobs: (Blob | null)[];
  private decoded = new Map<number, Drawable>();
  private decoding = new Set<number>();
  private lru: number[] = [];
  private anchors = new Set<number>();
  private maxDecoded: number;
  private loadedCount = 0;
  private destroyed = false;
  private abort = new AbortController();
  private hasBitmap = typeof createImageBitmap === "function";

  /** Called whenever a new frame becomes drawable. */
  onChange: () => void = () => {};
  /** Called with 0 → 1 as frames download. */
  onProgress: (p: number) => void = () => {};

  constructor(urls: string[], { frameBytes, budgetBytes }: { frameBytes: number; budgetBytes: number }) {
    this.urls = urls;
    this.count = urls.length;
    this.blobs = new Array(urls.length).fill(null);
    this.maxDecoded = Math.max(12, Math.min(urls.length, Math.floor(budgetBytes / frameBytes)));

    // Anchors use at most ~40% of the decode budget.
    const step = Math.max(1, Math.ceil(urls.length / Math.floor(this.maxDecoded * 0.4)));
    for (let i = 0; i < urls.length; i += step) this.anchors.add(i);
    this.anchors.add(urls.length - 1);
  }

  /** Frame 0 first (and awaited), then everything else coarse-to-fine. */
  async loadFirst() {
    await this.fetchFrame(0);
    await this.decode(0);
  }

  loadRest() {
    const order: number[] = [];
    const seen = new Set<number>([0]);
    // Coarse-to-fine: every 32nd frame, then 16th, 8th … so early scrubbing
    // already has an even spread of real frames.
    for (let step = 32; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < this.count; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
      if (step === 1) break;
    }
    if (!seen.has(this.count - 1)) order.push(this.count - 1);

    let cursor = 0;
    const worker = async () => {
      while (cursor < order.length && !this.destroyed) {
        const i = order[cursor++];
        await this.fetchFrame(i);
        if (this.anchors.has(i)) await this.decode(i);
      }
    };
    for (let w = 0; w < FETCH_CONCURRENCY; w++) void worker();
  }

  private async fetchFrame(i: number, attempt = 0): Promise<void> {
    if (this.blobs[i] || this.destroyed) return;
    try {
      const res = await fetch(this.urls[i], { signal: this.abort.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.blobs[i] = await res.blob();
      this.loadedCount++;
      this.onProgress(this.loadedCount / this.count);
    } catch (err) {
      if (this.destroyed || (err as Error).name === "AbortError") return;
      if (attempt < 2) return this.fetchFrame(i, attempt + 1);
    }
  }

  private async decode(i: number) {
    if (this.decoded.has(i) || this.decoding.has(i) || this.destroyed) return;
    const blob = this.blobs[i];
    if (!blob) return;
    this.decoding.add(i);
    try {
      let drawable: Drawable;
      if (this.hasBitmap) {
        drawable = await createImageBitmap(blob);
      } else {
        // Fallback for browsers without createImageBitmap.
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await img.decode();
        drawable = img;
      }
      if (this.destroyed) {
        if ("close" in drawable) drawable.close();
        return;
      }
      this.decoded.set(i, drawable);
      this.touch(i);
      this.evict();
      this.onChange();
    } catch {
      /* corrupt frame — nearest() will cover it */
    } finally {
      this.decoding.delete(i);
    }
  }

  private touch(i: number) {
    if (this.anchors.has(i)) return;
    const at = this.lru.indexOf(i);
    if (at !== -1) this.lru.splice(at, 1);
    this.lru.push(i);
  }

  private evict() {
    while (this.decoded.size > this.maxDecoded && this.lru.length) {
      const victim = this.lru.shift()!;
      const d = this.decoded.get(victim);
      if (d && "close" in d) d.close();
      else if (d) URL.revokeObjectURL(d.src);
      this.decoded.delete(victim);
    }
  }

  /**
   * Ask for the frames around `position` to be decoded. `direction` (+1 / -1)
   * biases the look-ahead towards where the user is scrolling.
   */
  prefetch(position: number, direction: number) {
    const base = Math.round(position);
    const ahead = 10;
    const behind = 3;
    const want: number[] = [base];
    for (let d = 1; d <= ahead; d++) {
      want.push(base + d * (direction >= 0 ? 1 : -1));
      if (d <= behind) want.push(base - d * (direction >= 0 ? 1 : -1));
    }
    for (const i of want) {
      if (i < 0 || i >= this.count) continue;
      if (this.decoded.has(i)) this.touch(i);
      else if (this.blobs[i]) void this.decode(i);
    }
  }

  get(i: number): Drawable | undefined {
    return this.decoded.get(i);
  }

  /** The decoded frame closest to `i` (searching outward). */
  nearest(i: number): { index: number; frame: Drawable } | null {
    const exact = this.decoded.get(i);
    if (exact) return { index: i, frame: exact };
    for (let d = 1; d < this.count; d++) {
      const lo = this.decoded.get(i - d);
      if (lo) return { index: i - d, frame: lo };
      const hi = this.decoded.get(i + d);
      if (hi) return { index: i + d, frame: hi };
    }
    return null;
  }

  destroy() {
    this.destroyed = true;
    this.abort.abort();
    for (const d of this.decoded.values()) {
      if ("close" in d) d.close();
      else URL.revokeObjectURL(d.src);
    }
    this.decoded.clear();
    this.blobs = [];
  }
}
