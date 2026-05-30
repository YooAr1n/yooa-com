const PERF_ENABLED = true;
const LONG_FRAME_MS = 16;
const WINDOW_MS = 1000;

function makeMetric() {
  return { calls: 0, total: 0, max: 0 };
}

export const PerfStats = {
  startedAt: typeof performance !== "undefined" ? performance.now() : Date.now(),
  windowStart: typeof performance !== "undefined" ? performance.now() : Date.now(),
  frames: 0,
  totalFrames: 0,
  frameTimeTotal: 0,
  frameTimeMax: 0,
  scriptingTotal: 0,
  longTasks: 0,
  lastFrameAt: 0,
  functions: {
    gameLoop: makeMetric(),
    calc: makeMetric(),
    tick: makeMetric(),
    updateEffect: makeMetric(),
    updateAmount: makeMetric()
  },
  lastReport: null
};

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function perfBegin() {
  return PERF_ENABLED ? nowMs() : 0;
}

export function perfEnd(name, start) {
  if (!PERF_ENABLED || !start) return 0;
  const dt = nowMs() - start;
  let metric = PerfStats.functions[name];
  if (!metric) metric = PerfStats.functions[name] = makeMetric();
  metric.calls++;
  metric.total += dt;
  if (dt > metric.max) metric.max = dt;
  return dt;
}

export function perfFrame(frameStart, scriptingTime) {
  if (!PERF_ENABLED || !frameStart) return;
  const now = nowMs();
  const frameTime = PerfStats.lastFrameAt ? now - PerfStats.lastFrameAt : 0;
  PerfStats.lastFrameAt = now;
  PerfStats.frames++;
  PerfStats.totalFrames++;
  if (frameTime > 0) {
    PerfStats.frameTimeTotal += frameTime;
    if (frameTime > PerfStats.frameTimeMax) PerfStats.frameTimeMax = frameTime;
    if (scriptingTime > LONG_FRAME_MS) PerfStats.longTasks++;
  }
  PerfStats.scriptingTotal += scriptingTime;

  if (now - PerfStats.windowStart >= WINDOW_MS) {
    PerfStats.lastReport = getPerfSnapshot(false);
    PerfStats.windowStart = now;
    PerfStats.frames = 0;
    PerfStats.frameTimeTotal = 0;
    PerfStats.frameTimeMax = 0;
    PerfStats.scriptingTotal = 0;
    PerfStats.longTasks = 0;
    const fn = PerfStats.functions;
    for (const k in fn) {
      fn[k].calls = 0;
      fn[k].total = 0;
      fn[k].max = 0;
    }
  }
}

export function getPerfSnapshot(useLifetime = true) {
  const now = nowMs();
  const elapsed = Math.max(1, now - (useLifetime ? PerfStats.startedAt : PerfStats.windowStart));
  const frames = useLifetime ? PerfStats.totalFrames : PerfStats.frames;
  const scripting = PerfStats.scriptingTotal;
  const avgFrameTime = frames ? PerfStats.frameTimeTotal / frames : 0;
  const avgScripting = frames ? scripting / frames : 0;
  const fns = {};
  const totalFnTime = Object.values(PerfStats.functions).reduce((sum, m) => sum + m.total, 0) || 1;
  for (const k in PerfStats.functions) {
    const m = PerfStats.functions[k];
    fns[k] = {
      calls: m.calls,
      total: m.total,
      avg: m.calls ? m.total / m.calls : 0,
      percent: (m.total / totalFnTime) * 100
    };
  }
  return {
    fps: frames * 1000 / elapsed,
    avgFrameTime,
    avgScriptingTime: avgScripting,
    worstFrameTime: PerfStats.frameTimeMax,
    longTasks: PerfStats.longTasks,
    scriptingTimePerSecond: scripting * 1000 / elapsed,
    cpuUsageEstimate: Math.min(100, scripting / elapsed * 100),
    functions: fns
  };
}

export function formatBenchmark(label, snap = getPerfSnapshot(false)) {
  const fn = snap.functions;
  const gameLoop = fn.gameLoop || { total: 0 };
  const calc = fn.calc || { total: 0 };
  return `${label}:\n\n* FPS: ${snap.fps.toFixed(1)}\n* Avg Frame Time: ${snap.avgFrameTime.toFixed(2)} ms\n* Avg Scripting Time: ${snap.avgScriptingTime.toFixed(2)} ms\n* CPU Usage Estimate: ${snap.cpuUsageEstimate.toFixed(1)}%\n* Long Tasks: ${snap.longTasks}\n* gameLoop Time: ${gameLoop.total.toFixed(2)} ms\n* calc Time: ${calc.total.toFixed(2)} ms`;
}

if (typeof window !== "undefined") {
  window.YooAPerf = {
    stats: PerfStats,
    snapshot: getPerfSnapshot,
    report: () => formatBenchmark("CURRENT", PerfStats.lastReport || getPerfSnapshot(false))
  };
}
