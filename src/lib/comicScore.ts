export type ScoreHandle = {
  setMuted: (muted: boolean) => void
  whoosh: () => void
  stop: () => void
}

export function createComicScore(): ScoreHandle | null {
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  const ctx = new AudioCtx()
  const master = ctx.createGain()
  master.gain.value = 0.11
  master.connect(ctx.destination)

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 720
  lp.Q.value = 0.7
  lp.connect(master)

  const pad = ctx.createGain()
  pad.gain.value = 0.7
  pad.connect(lp)

  const oscA = ctx.createOscillator()
  oscA.type = 'sine'
  oscA.frequency.value = 146.83
  const oscB = ctx.createOscillator()
  oscB.type = 'triangle'
  oscB.frequency.value = 220
  const oscC = ctx.createOscillator()
  oscC.type = 'sine'
  oscC.frequency.value = 329.63
  oscA.connect(pad)
  oscB.connect(pad)
  oscC.connect(pad)
  oscA.start()
  oscB.start()
  oscC.start()

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 18
  lfo.connect(lfoGain)
  lfoGain.connect(lp.frequency)
  lfo.start()

  void ctx.resume()

  return {
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0 : 0.11, ctx.currentTime, 0.08)
    },
    whoosh() {
      const len = 0.16
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 980
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len)
      src.connect(bp)
      bp.connect(g)
      g.connect(master)
      src.start()
    },
    stop() {
      try {
        oscA.stop()
        oscB.stop()
        oscC.stop()
        lfo.stop()
        void ctx.close()
      } catch {
        /* already closed */
      }
    },
  }
}
