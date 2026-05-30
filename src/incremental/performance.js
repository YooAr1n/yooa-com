let PERF_ENABLED = typeof window !== "undefined" && window.localStorage?.getItem("YooAPerfDeep") === "1";
const LONG_FRAME_MS = 16;
const WINDOW_MS = 1000;

function makeMetric() {
  return { calls: 0, total: 0, self: 0, max: 0 };
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
  counters: {
    decimalOps: 0,
    domUpdates: 0,
    formatCalls: 0,
    formatCacheHits: 0,
    memoryAllocationsEstimate: 0
  },
  memory: {
    start: 0,
    last: 0,
    allocatedBytesEstimate: 0
  },
  stack: [],
  functions: {
    gameLoop: makeMetric(),
    calc: makeMetric(),
    tick: makeMetric(),
    tickDue: makeMetric(),
    Autobuyer_tickMethod: makeMetric(),
    getValue: makeMetric(),
    updateAmount: makeMetric(),
    upgradeEffect: makeMetric(),
    formatting: makeMetric(),
    uiUpdate: makeMetric()
  },
  lastReport: null
};

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function perfBegin() {
  if (!PERF_ENABLED) return 0;
  return { t: nowMs(), child: 0 };
}

export function perfEnd(name, start) {
  if (!PERF_ENABLED || !start) return 0;
  const dt = nowMs() - start.t;
  const self = dt - start.child;
  const parent = PerfStats.stack[PerfStats.stack.length - 1];
  if (parent && parent !== start) parent.child += dt;
  let metric = PerfStats.functions[name];
  if (!metric) metric = PerfStats.functions[name] = makeMetric();
  metric.calls++;
  metric.total += dt;
  metric.self += self > 0 ? self : 0;
  if (dt > metric.max) metric.max = dt;
  return dt;
}

export function perfWrap(name, fn, thisArg, args) {
  if (!PERF_ENABLED) return fn.apply(thisArg, args);
  const token = perfBegin();
  PerfStats.stack.push(token);
  try {
    return fn.apply(thisArg, args);
  } finally {
    PerfStats.stack.pop();
    perfEnd(name, token);
  }
}

export function perfCount(name, amount = 1) {
  if (!PERF_ENABLED) return;
  PerfStats.counters[name] = (PerfStats.counters[name] || 0) + amount;
}

function resetPerfStats() {
  const now = nowMs();
  PerfStats.startedAt = now;
  PerfStats.windowStart = now;
  PerfStats.frames = 0;
  PerfStats.totalFrames = 0;
  PerfStats.frameTimeTotal = 0;
  PerfStats.frameTimeMax = 0;
  PerfStats.scriptingTotal = 0;
  PerfStats.longTasks = 0;
  PerfStats.lastFrameAt = 0;
  PerfStats.memory.start = 0;
  PerfStats.memory.last = 0;
  PerfStats.memory.allocatedBytesEstimate = 0;
  for (const k in PerfStats.functions) {
    PerfStats.functions[k].calls = 0;
    PerfStats.functions[k].total = 0;
    PerfStats.functions[k].self = 0;
    PerfStats.functions[k].max = 0;
  }
  for (const k in PerfStats.counters) PerfStats.counters[k] = 0;
}

function sampleMemory() {
  const mem = typeof performance !== "undefined" && performance.memory ? performance.memory : null;
  if (!mem) return;
  if (!PerfStats.memory.start) PerfStats.memory.start = mem.usedJSHeapSize;
  if (PerfStats.memory.last && mem.usedJSHeapSize > PerfStats.memory.last) {
    PerfStats.memory.allocatedBytesEstimate += mem.usedJSHeapSize - PerfStats.memory.last;
    PerfStats.counters.memoryAllocationsEstimate++;
  }
  PerfStats.memory.last = mem.usedJSHeapSize;
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
  sampleMemory();

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
      fn[k].self = 0;
      fn[k].max = 0;
    }
    for (const k in PerfStats.counters) PerfStats.counters[k] = 0;
    PerfStats.memory.allocatedBytesEstimate = 0;
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
      callsPerSecond: m.calls * 1000 / elapsed,
      total: m.total,
      avg: m.calls ? m.total / m.calls : 0,
      self: m.self,
      percent: (m.total / totalFnTime) * 100
    };
  }
  const counters = {};
  for (const k in PerfStats.counters) counters[k] = PerfStats.counters[k] * 1000 / elapsed;
  return {
    fps: frames * 1000 / elapsed,
    avgFrameTime,
    avgScriptingTime: avgScripting,
    worstFrameTime: PerfStats.frameTimeMax,
    longTasks: PerfStats.longTasks,
    scriptingTimePerSecond: scripting * 1000 / elapsed,
    cpuUsageEstimate: Math.min(100, scripting / elapsed * 100),
    functions: fns,
    counters,
    memoryAllocatedBytesPerSecond: PerfStats.memory.allocatedBytesEstimate * 1000 / elapsed
  };
}

export function formatFunctionTable(snap = getPerfSnapshot(false)) {
  const rows = Object.keys(snap.functions)
    .filter(k => snap.functions[k].calls > 0)
    .sort((a, b) => snap.functions[b].total - snap.functions[a].total)
    .map(k => {
      const m = snap.functions[k];
      return `| ${k} | ${m.callsPerSecond.toFixed(1)} | ${m.avg.toFixed(4)} | ${m.total.toFixed(2)} | ${m.self.toFixed(2)} |`;
    });
  return ["| Function | Calls/sec | Avg ms | Total ms | Self ms |", "| -------- | --------- | ------ | -------- | ------- |", ...rows].join("\n");
}

export function formatBenchmark(label, snap = getPerfSnapshot(false)) {
  const fn = snap.functions;
  const gameLoop = fn.gameLoop || { total: 0 };
  const calc = fn.calc || { total: 0 };
  return `${label}:\n\n* FPS: ${snap.fps.toFixed(1)}\n* Avg Frame Time: ${snap.avgFrameTime.toFixed(2)} ms\n* Avg Scripting Time: ${snap.avgScriptingTime.toFixed(2)} ms\n* CPU Usage Estimate: ${snap.cpuUsageEstimate.toFixed(1)}%\n* Long Tasks: ${snap.longTasks}\n* gameLoop Time: ${gameLoop.total.toFixed(2)} ms\n* calc Time: ${calc.total.toFixed(2)} ms\n* Decimal Operations/sec: ${(snap.counters.decimalOps || 0).toFixed(1)}\n* DOM Updates/sec: ${(snap.counters.domUpdates || 0).toFixed(1)}\n* Formatting Calls/sec: ${(snap.counters.formatCalls || 0).toFixed(1)}\n* Autobuyer Calls/sec: ${((fn.tickDue && fn.tickDue.callsPerSecond) || 0).toFixed(1)}\n* Memory Allocated/sec (estimate): ${(snap.memoryAllocatedBytesPerSecond / 1024).toFixed(1)} KiB\n\n${formatFunctionTable(snap)}`;
}

export function instrumentDecimal(Decimal) {
  if (!PERF_ENABLED) return;
  if (!Decimal || Decimal.__yooaPerfInstrumented) return;
  Decimal.__yooaPerfInstrumented = true;
  const wrapStatic = (method, metricName) => {
    if (typeof Decimal[method] !== "function") return;
    const original = Decimal[method];
    Decimal[method] = function wrappedDecimalStatic(...args) {
      perfCount("decimalOps");
      return perfWrap(metricName, original, this, args);
    };
  };
  wrapStatic("pow", "Decimal.pow");
  wrapStatic("log10", "Decimal.log10");
  wrapStatic("exp", "Decimal.exp");
  wrapStatic("root", "Decimal.root");
  wrapStatic("tetrate", "Decimal.tetrate");
  wrapStatic("slog", "Decimal.slog");

  const protoMap = {
    pow: "Decimal.pow",
    log10: "Decimal.log10",
    exp: "Decimal.exp",
    root: "Decimal.root",
    tetrate: "Decimal.tetrate",
    slog: "Decimal.slog"
  };
  for (const method in protoMap) {
    if (typeof Decimal.prototype[method] !== "function") continue;
    const original = Decimal.prototype[method];
    Decimal.prototype[method] = function wrappedDecimalProto(...args) {
      perfCount("decimalOps");
      return perfWrap(protoMap[method], original, this, args);
    };
  }
}

if (typeof window !== "undefined") {
  window.YooAPerf = {
    stats: PerfStats,
    get enabled() { return PERF_ENABLED; },
    enable() {
      window.localStorage?.setItem("YooAPerfDeep", "1");
      PERF_ENABLED = true;
      resetPerfStats();
      return "Deep profiling enabled. Reload to include Decimal method instrumentation.";
    },
    disable() {
      window.localStorage?.removeItem("YooAPerfDeep");
      PERF_ENABLED = false;
      resetPerfStats();
      return "Deep profiling disabled.";
    },
    snapshot: getPerfSnapshot,
    table: () => formatFunctionTable(PerfStats.lastReport || getPerfSnapshot(false)),
    report: () => formatBenchmark("CURRENT", PerfStats.lastReport || getPerfSnapshot(false))
  };
}
