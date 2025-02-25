// Pre-compiled regex for comma insertion
const commaRegex = /\B(?=(\d{3})+(?!\d))/g;

window.addCommas = function addCommas(s) {
  return s.replace(commaRegex, ",");
};

window.exponentialFormat = function exponentialFormat(num, precision) {
  let e = num.log10().floor();
  let m = num.div(Decimal.pow(10, e));
  // If rounding causes m to equal 10, adjust m and increase e.
  if (m.toStringWithDecimalPlaces(precision) == 10) {
    m = Decimal.dOne;
    e = e.add(1);
  }
  let start = "";
  if (e.abs().lt(1e9)) {
    start = m.toStringWithDecimalPlaces(precision);
  }
  let end = e.toStringWithDecimalPlaces(0);
  // Use .includes instead of creating a Set
  if (!end.includes("e")) end = addCommas(end.replace(/-/g, ""));
  if (e.lt(0)) end = `-${end}`;
  return `${start}e${end}`;
};

window.commaFormat = function commaFormat(num, precision) {
  if (!num || num.mag < 0.001) return "0".padStart(precision + 1, "0");
  let init = num.toStringWithDecimalPlaces(precision);
  return init.replace(commaRegex, ",");
};

window.regularFormat = function regularFormat(num, precision) {
  if (!num || num.mag < 0.0001) return "0".padStart(precision + 1, "0");
  // Boost precision when mag is very low
  if (num.mag < 0.1 && precision !== 0) precision = Math.max(precision, 4);
  return num.toStringWithDecimalPlaces(precision);
};

window.fixValue = function fixValue(x, y = 0) {
  return x || new Decimal(y);
};

window.sumValues = function sumValues(x) {
  const values = Object.values(x);
  return values.length > 0 ? values.reduce((a, b) => Decimal.add(a, b)) : Decimal.dZero;
};

window.format = function format(decimal, precision = 2) {
  decimal = new Decimal(decimal);
  if (decimal.sign === 0) return decimal.toStringWithDecimalPlaces(precision);
  if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) return "NaN";
  if (decimal.sign < 0) return `-${format(decimal.neg(), precision)}`;
  if (decimal.mag === Number.POSITIVE_INFINITY) return "Infinity";

  const slog = slog10(decimal);
  const isLayer3 = decimal.layer > 3 || (decimal.mag >= 1e10 && decimal.layer === 3);
  const isLayer2 = decimal.layer > 2 || (Math.abs(decimal.mag) > 100 && decimal.layer === 2);
  const isLayer1 = decimal.layer > 1 || (Math.abs(decimal.mag) >= 1e12 && decimal.layer === 1);
  const isLayer0 = decimal.layer > 0 || (decimal.mag >= 1e9);

  if (isLayer3) {
    if (slog.gte(1e9)) return `F${formatWhole(slog.floor())}`;
    return `${Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(4)}F${commaFormat(slog.floor(), 0)}`;
  }
  if (isLayer2 || isLayer1) return `e${format(decimal.log10(), isLayer2 ? precision : 4)}`;
  if (isLayer0) return exponentialFormat(decimal, precision);
  return decimal.mag >= 1000 
      ? commaFormat(decimal, 0) 
      : decimal.mag < 0.001 
      ? exponentialFormat(decimal, precision) 
      : regularFormat(decimal, precision);
};

window.formatWhole = function formatWhole(decimal) {
  decimal = new Decimal(decimal);
  if (decimal.gte(1e9)) return format(decimal, 2);
  if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2);
  return format(decimal, 0);
};

window.formatTime = function formatTime(s) {
  // Assuming 's' is a Decimal or number
  if (s.gte(31556952)) return `${format(s.div(31556952))}y`;
  if (s < 60) return `${format(s)}s`;
  if (s < 3600) return `${formatWhole(Math.floor(s / 60))}m ${format(s % 60)}s`;
  if (s < 86400)
    return `${formatWhole(Math.floor(s / 3600))}h ${formatWhole(Math.floor(s / 60) % 60)}m ${format(s % 60)}s`;
  if (s < 31556952)
    return `${formatWhole(Math.floor(s / 86400) % 365)}d ${formatWhole(Math.floor(s / 3600) % 24)}h ${formatWhole(Math.floor(s / 60) % 60)}m ${format(s % 60)}s`;
  return `${formatWhole(Math.floor(s / 31556952))}y ${formatWhole(Math.floor(s / 86400) % 365)}d ${formatWhole(Math.floor(s / 3600) % 24)}h ${formatWhole(Math.floor(s / 60) % 60)}m ${format(s % 60)}s`;
};

window.toPlaces = function toPlaces(x, precision, maxAccepted) {
  x = new Decimal(x);
  let result = x.toStringWithDecimalPlaces(precision);
  if (new Decimal(result).gte(maxAccepted)) {
    result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision);
  }
  return result;
};

window.formatSmall = function formatSmall(x, precision = 2) {
  return format(x, precision);
};

window.invertOOM = function invertOOM(x) {
  let e = x.log10().ceil();
  let m = x.div(Decimal.pow(10, e));
  e = e.neg();
  return Decimal.pow(10, e).times(m);
};

window.colorText = function colorText(elem, color, text) {
  return `<${elem} style="color:${color};text-shadow:0px 0px 10px;">${text}</${elem}>`;
};

window.formatGain = function formatGain(a, e, FPS, percent, DT = tet10(10)) {
  a = new Decimal(a);
  e = new Decimal(e);
  const g = a.add(e.div(FPS));

  if (!g.eq(a) || percent) {
    if (a.gte(DT)) {
      const oom = slog10(g).sub(slog10(a)).mul(FPS);
      if (oom.gte(1e-3)) return `(+${format(oom)} OoMs^^2/s)`;
    }
    if (a.gte("ee100")) {
      const tower = Math.floor(slog10(a).toNumber() - 1.3010299956639813);
      let oom = slogsub(g, tower).sub(slogsub(a, tower)).mul(FPS);
      if (oom.gte(1)) return `(+${format(oom)} OoMs^${tower}/s)`;
    }
    if (a.gte(1e100) || percent) {
      const oom = g.div(a).log10().mul(FPS);
      if (oom.gte(10)) return `(+${format(oom)} OoMs/s)`;
      if (oom.gte(Math.log10(2)) || percent) return `(+${format(oom.pow10().sub(1).mul(100))}%/s)`;
    }
  }
  return `(${e.lt(0) ? "" : "+"}${format(e)}/s)`;
};

window.slogsub = function slogsub(n, sub) {
  return tet10(slog10(n).sub(sub));
};

window.tet10 = function tet10(num) {
  if (num < -2) return Decimal.dNaN;
  num = new Decimal(num);
  const numFloor = num.floor();
  let result = num.sub(numFloor).pow10();
  result.layer = numFloor.toNumber();
  return norm(result);
};

window.slog10 = function slog10(num) {
  let slogmag;
  if (num.mag < 10) {
    slogmag = Math.log10(num.mag);
  } else if (num.mag < 1e10) {
    slogmag = 1 + Math.log10(Math.log10(num.mag));
  } else {
    slogmag = 2 + Math.log10(Math.log10(Math.log10(num.mag)));
  }
  return new Decimal(num.layer + slogmag);
};

window.norm = function norm(num) {
  num = new Decimal(num);
  const FIRST_NEG_LAYER = 1 / 9e15;
  const EXP_LIMIT = 9e15;
  const LAYER_DOWN = Math.log10(9e15);

  if (num.sign === 0 || (num.mag === 0 && num.layer === 0)) {
    num.sign = 0;
    num.mag = 0;
    num.layer = 0;
    return num;
  }
  if (num.layer === 0 && num.mag < 0) {
    num.mag = -num.mag;
    num.sign = -num.sign;
  }
  if (
    num.mag === Number.POSITIVE_INFINITY ||
    num.layer === Number.POSITIVE_INFINITY ||
    num.mag === Number.NEGATIVE_INFINITY ||
    num.layer === Number.NEGATIVE_INFINITY
  ) {
    return num.set({ mag: Number.POSITIVE_INFINITY, layer: Number.POSITIVE_INFINITY });
  }
  if (num.layer === 0 && num.mag < FIRST_NEG_LAYER) {
    num.layer += 1;
    num.mag = Math.log10(num.mag);
    return num;
  }

  let absmag = Math.abs(num.mag);
  let signmag = Math.sign(num.mag);

  if (absmag >= EXP_LIMIT) {
    num.layer += 1;
    num.mag = signmag * Math.log10(absmag);
    return num;
  } else {
    while (absmag < LAYER_DOWN && num.layer > 0) {
      num.layer -= 1;
      if (num.layer === 0) {
        num.mag = Math.pow(10, num.mag);
      } else {
        num.mag = signmag * Math.pow(10, absmag);
        absmag = Math.abs(num.mag);
        signmag = Math.sign(num.mag);
      }
    }
    if (num.layer === 0) {
      if (num.mag < 0) {
        num.mag = -num.mag;
        num.sign = -num.sign;
      } else if (num.mag === 0) {
        num.sign = 0;
      }
    }
  }
  if (Number.isNaN(num.sign) || Number.isNaN(num.layer) || Number.isNaN(num.mag)) {
    num.sign = NaN;
    num.mag = NaN;
    num.layer = NaN;
    return num;
  }
  return num;
};

window.scale = function scale(s) {
  s = new Decimal(s);
  let isNegative = false;

  if (s.eq(0)) {
    return "If every YooA Point is a litre of water, you'll be left thirsty because you have no water.";
  }
  if (s.eq(Decimal.dInf) || s.eq(Decimal.dNegInf)) {
    return "There is no scale that can accommodate the infinite.";
  }
  if (s.eq(Decimal.dNaN) || !s.isFinite()) {
    return "That is not a number, or there is an error with the input.";
  }
  if (s.lt(0)) {
    isNegative = true;
    s = s.abs();
  }
  let isReciprocal = false;
  if (s.lt(282e-44)) {
    isReciprocal = true;
    s = s.recip();
  }
  if (isNegative && !isReciprocal) {
    return "(Negative numbers are not supported, so using the absolute value instead): " + scale(s);
  }
  if (!isNegative && isReciprocal) {
    return "(That number is too small, so using its reciprocal instead): " + scale(s);
  }
  if (isNegative && isReciprocal) {
    return "(That number is both negative and too small, so using its negative reciprocal instead): " + scale(s);
  }

  const scaleNames = ["protons", "uranium nuclei", "hydrogen atoms", "water molecules", "viruses", "red blood cells", "grains of sand", "grains of rice", "teaspoons", "large water bottles", "car fuel tanks", "fridge-freezers", "school buses", "Olympic-sized swimming pools", "Great Pyramids of Giza", "Sydney Harbors", "Lake Superiors", "Pacific Oceans", "Earths", "Jupiters", "Suns", "red giant stars", "hypergiant stars", "nebulas", "Oort clouds", "small dwarf galaxies", "galaxies", "galaxy groups", "galactic superclusters", "observable universes"];
  const scaleValues = [282e-44, 6.7116e-40, 723e-29, 21952e-30, 5e-18, 9e-14, 62e-9, 5e-5, 0.003555, 1, 52.995764976, 1e3, 67596.84, 25e5, 26006e5, 562e9, 12232e12, 66988e16, 108321e19, 14313e23, 1.412e30, 5e35, 8e39, 17e47, 17e50, 3e58, 33e63, 5e71, 35e74, 34e82];
  const scaleTimes = ["seconds", "minutes", "hours", "days", "weeks", "years", "decades", "centuries", "millennia", "galactic years", "Sun lifespans", "red dwarf lifespans", "bismuth-209 half-lives"];
  const scaleTimeValues = [1, 60, 3600, 86400, 604800, 31556952, 315569520, 3155695200, 31556952000, 70956e11, 31556952e10, 31556952e13, 6338736e20];
  const scaleHeights = ["hydrogen atoms", "wavelengths of green light", "grains of sand", "pieces of paper", "adult humans", "American football fields", "Burj Khalifas", "Mount Everests", "the altitude of the International Space Station", "Earths", "the distance from the Earth to the Moon", "the distance from the Earth to the Sun", "the distance from the Sun to Neptune", "the distance from the Sun to Proxima Centauri", "galaxies", "galactic superclusters", "observable universes"];
  const scaleHeightValues = [5.6692908e-8, 0.000125787444, 0.11811024, 66, 399.21258, 21600, 32598.43, 2090281.8, 98622e3, 3009921e3, 9094488e4, 3533808e7, 10626162e8, 9430902e12, 195348e18, 11621016e18, 44919702e19, 2094018e23];

  if (s.lt("e1000")) {
    let id2 = scaleValues.findIndex(value => s.lt(value)) - 1;
    if (id2 === -2) id2 = scaleValues.length - 1;
    const mag = s.div(scaleValues[id2]);
    return `If every YooA Point is a litre of water, you could fill ${format(mag)} ${scaleNames[id2]}.`;
  }
  if (s.lt("ee15")) {
    s = s.log2();
    let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
    if (id2 === -2) id2 = scaleTimeValues.length - 1;
    const mag = s.div(scaleTimeValues[id2]);
    return `If you started with a single bacteria and the bacteria split in two every second, then with unlimited space and resources, it would take ${format(mag)} ${scaleTimes[id2]} for the colony to reach a population equal to your YooA Points.`;
  }
  const o = [4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 5, 5, 5, 5, 4, 4, 4];
  s = slog10(s);
  let id2 = scaleHeightValues.findIndex(value => s.lt(value)) - 1;
  if (id2 === -2) id2 = scaleHeightValues.length - 1;
  const mag = s.div(scaleHeightValues[id2]);
  if (o[id2] === 4) {
    return `If your YooA Point amount was written as a power tower of 10s in 12-point font, that tower would be as tall as ${format(mag)} ${scaleHeights[id2]}.`;
  }
  return `If your YooA Point amount was written as a power tower of 10s in 12-point font, that tower would be ${format(mag)} times as tall as ${scaleHeights[id2]}.`;
};