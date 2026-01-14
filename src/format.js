// format.js (this has the code for cancer formatting and other notations)

(() => {
  const commaRegex = /\B(?=(\d{3})+(?!\d))/g;
  const illions = [
    ["", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"], // tier 1
    ["", "Mi", "Mc", "Na", "Pc", "Fm", "At", "Zp", "Yc", "Rt"], // tier 2
    ["", "Kl", "Mg", "Gi", "Ter", "Pt", "Ex", "Zt", "Yt", "Rn"], // tier 3
    ["", "aL", "eJ", "iJ", "AsT", "uN", "rM", "oV", "oL", "eT", "O", "aX", "uP", "rS", "lT"], // tier 4
  ]
  const ones = [
    ["", "U", "D", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"], // tier 1
    ["", "Me", "Du", "Tr", "Te", "Pe", "He", "Hp", "Ot", "En"], // tier 2
    ["", "eN", "oD", "tR", "tE", "pT", "eX", "zE", "yO", "rN"], // tier 3
  ]
  const tens = [
    ["", "Dc", "Vg", "Tg", "Qd", "Qq", "Se", "St", "Og", "Nn"], // tier 1
    ["", "c", "Ic", "TCn", "TeC", "PCn", "HCn", "HpC", "OCn", "ECn"], // tier 2
    ["", "", "I", "Tr", "Te", "P", "E", "Z", "Y", "N"], // tier 3
  ]
  const hundreds = [
    ["", "Ce", "Dn", "Tc", "Qe", "Qu", "Sc", "Si", "Oe", "Ne"], // tier 1
    ["", "Hc", "DHe", "THt", "TeH", "PHc", "HHe", "HpH", "OHt", "EHc"], // tier 2
    ["", "Ho", "Bo", "Tro", "To", "Po", "Exo", "Zo", "Yo", "No"], // tier 3
  ]
  const tier4adds = [
    "", "K", "M", "G", "", "L", "F", "J", "S", "B", "Gl", "G", "S", "V", "M" // this is before t4 illions, and is added only if theres no multiplier for tier 4
  ]
  const tier3teens = [
    "Qt", "Hn", "Dok", "TrD", "TeD", "PeD", "ExD", "ZeD", "YoD", "NeD" // this is t3 #10 to #19
  ]
  const tier3adds = [
    "k", "k", "c", "c", "c", "k", "k", "c", "k", "c" // this is after t3 tens (added based on the ones place of t3)
  ]

  const letters = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "@"
  ]
  const emoji = [ // cancer emoji alphabet
    "😠🎂🎄💀🍆👪🌈💯🍦🎃💋😂🌙⛔🐙💩❓🚀🙈👍🔓✌🧇❌😋⚡",
    "🚨👶🍒😈💥👠🔫🏥👀🤹😵💻🔢🌑🍩💍👑🐇💰🏆🦄🌋🤷🩻🟡💤",
    "😲"
  ]

  function isDecimalLike(x) {
    return x && typeof x.sign === "number";
  }

  const D = typeof Decimal !== "undefined" ? Decimal : null;
  const dZero = D?.dZero || 0;
  const dOne = D?.dOne || 1;
  const dInf = D?.dInf || Infinity;
  const SAFE_NUM_MAG = 1e12;

  function toDecimal(x) {
    return isDecimalLike(x) ? x : new Decimal(x);
  }

  function pow10(e) { return D.pow(10, e); }

  window.addCommas = function addCommas(s) {
    return String(s).replace(commaRegex, ",");
  };

  window.exponentialFormat = function exponentialFormat(numIn, precision = 2, notation = "Scientific") {
    const num = toDecimal(numIn);
    const exp = notation.includes("Scientific") ? 1 : 3
    const e = num.log10().div(exp).floor().mul(exp);
    const m = num.div(pow10(e));
    const mStr = m.toStringWithDecimalPlaces(precision);
    let mant = mStr;
    let expo = e.toStringWithDecimalPlaces(0);
    if (mant == 10 ** (exp)) {
      mant = dOne.toStringWithDecimalPlaces(precision);
      expo = e.add(dOne).toStringWithDecimalPlaces(0);
    }
    let absExpo = expo.replace(/-/g, "");
    if (!absExpo.includes("e")) absExpo = addCommas(absExpo);
    if (e.lt(0)) absExpo = "-" + absExpo;
    return e.abs().lt(1e9) ? `${mant}e${absExpo}` : `e${absExpo}`;
  };

  window.commaFormat = function commaFormat(numIn, precision = 0) {
    const num = toDecimal(numIn);
    if (!num || num.mag < 0.001) return "0".padStart(precision + 1, "0");
    return num.toStringWithDecimalPlaces(precision).replace(commaRegex, ",");
  };

  window.regularFormat = function regularFormat(numIn, precision = 2) {
    const num = toDecimal(numIn);
    if (!num || num.mag < 0.0001) return "0".padStart(precision + 1, "0");
    if (num.mag < 0.1 && precision) precision = Math.max(precision, 4);
    return num.toStringWithDecimalPlaces(precision);
  };

  window.tetrationalFormat = function tetrationalFormat(numIn, precision = 2, notation = "Scientific") {
    const num = toDecimal(numIn);
    const isSmall = num.lt(1);
    const slog = slog10(isSmall ? num.recip() : num)
    let f = slog.floor();
    let m = pow10(slog.sub(f));
    let mStr = m.toStringWithDecimalPlaces(precision + 2);
    if (mStr == 10) {
      mStr = dOne.toStringWithDecimalPlaces(precision + 2);
      f = f.add(dOne);
    }
    return (isSmall ? "1/" : "") + (slog.gte(SAFE_NUM_MAG) ? `F${formatWhole(f, notation)}` : slog.lt(1e9) ? `${mStr}F${commaFormat(f, 0)}` : `F${commaFormat(f, 0)}`);
  };

  window.fixValue = function fixValue(x, y = 0) {
    return x || new D(y);
  };

  window.sumValues = function sumValues(obj) {
    if (!obj) return dZero;
    const vals = Object.values(obj);
    if (!vals.length) return dZero;
    let acc = dZero;
    for (let i = 0; i < vals.length; ++i) acc = acc.add(toDecimal(vals[i]));
    return acc;
  };

  window.scientifify = function scientifify(numIn, base = 10) { // Converts a Decimal into a list of two Decimals, [b, e], such that b * (base)^e equals the original value.
    let valueD = toDecimal(numIn);
    let baseD = toDecimal(base);
    if (valueD.sign === 0) return [new Decimal(0), new Decimal(-Infinity)];
    if (valueD.eq(Decimal.dInf)) return [new Decimal(Infinity), new Decimal(Infinity)];
    if (valueD.eq(Decimal.dNegInf)) return [new Decimal(-Infinity), new Decimal(Infinity)];
    if (!valueD.isFinite()) return [new Decimal(NaN), new Decimal(NaN)];
    if (valueD.sign < 0) {
      const res = scientifify(valueD.neg(), baseD);
      return [res[0].neg(), res[1]];
    }
    if (baseD.eq(1) || baseD.lte(0)) {
      if (baseD.lt(0)) console.log("Negative base in scientifify");
      else console.log("Invalid base in scientifify")
      return [baseD, new Decimal(NaN)];
    }
    let e = valueD.log(baseD).floor();
    let b = baseD.pow(valueD.log(baseD).sub(e));
    return [b, e]
  }


  window.format = function format(decimalIn, precision = 2, notation = options.notation ? options.notation : "Scientific") {
    if (notation === "Blind") return ""; // hahaha blind mode
    if (notation === "YesNo") return toDecimal(decimalIn).eq(dZero) ? "NO" : "YES"; // hahaha YES / NO
    if (notation === "YooA") return formatYooA(decimalIn, precision); // yooa format
    if (notation === "Arin") return formatArin(decimalIn, precision); // arin format
    if (notation.includes("Logarithm")) return formatLog(decimalIn, precision, notation);
    if (notation.includes("Scientific") || notation.includes("Engineering")) return formatSciEng(decimalIn, precision, notation);
    if (notation === "Standard") return formatStandard(decimalIn, precision, "short");
    if (notation === "Standard (Long Scale)") return formatStandard(decimalIn, precision, "long");
    if (notation === "Letters") return formatLetters(decimalIn, precision, letters);
    if (notation === "Cancer") return formatLetters(decimalIn, precision, emoji);
  }

  /*
  YooA notation 
  Numbers start normal (x), and at 9.17, becomes 🌱 x . 
  🌱 x = x + 9.17
  At 🌱 9.17, it becomes 🌿 x.
  🌿x = 🌱 9.17x

  At 🌿 9.17, it becomes 🌺 x.
  🌺x = 🌿 9.17^x
  At 🌺 9.17, it becomes 🌈 x
  🌈x = 🌺 9.17^^x

  Negative numbers use 🥀.
  Reciprocal numbers use 🍃.
  Zero uses ⚰️.
  infinity uses ✨ .
  NaN uses ☠️ .
  */

  window.formatYooA = function formatYooA(decimalIn, precision = 2) {
    const dec = toDecimal(decimalIn);

    if (dec.sign === 0) return "⚰️";
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "☠️";
    if (dec.sign < 0) return "🥀" + formatYooA(dec.neg(), precision);
    if (dec.mag === Number.POSITIVE_INFINITY) return "✨";

    const isSmall = dec.lt(1);
    if (isSmall) return "🍃" + formatYooA(dec.recip(), precision)

    // Normal State — (x)
    if (dec.lt(9.17)) return dec.toStringWithDecimalPlaces(precision);

    // 🌱 Sprout State
    const sprout = dec.sub(9.17);
    if (sprout.lt(9.17)) return "🌱" + sprout.toStringWithDecimalPlaces(precision);

    // 🌿 Leaf State
    const leaf = sprout.div(9.17);
    if (leaf.lt(9.17)) return "🌿" + leaf.toStringWithDecimalPlaces(precision);

    // 🌺 Flower State
    const flower = leaf.log(9.17);
    if (flower.lt(9.17)) return "🌺" + flower.toStringWithDecimalPlaces(precision);

    // 🌈 Miracle State
    const miracle = slog(flower, 9.17);
    return "🌈" + formatYooA(miracle, precision);
  };

  /*
  Arin notation 
  Numbers start normal (x), and at 6.18, becomes 🌙 x . 
  🌙 x = x + 6.18
  At 🌙 6.18, it becomes ⭐ x.
  ⭐x = 🌙 6.18x

  At ⭐ 6.18, it becomes 💫 x.
  💫x = ⭐ 6.18^x
  At 💫 6.18, it becomes 👑 x
  👑x = 💫 6.18^^x

  Negative numbers use 🌑.
  Reciprocal numbers use 🌬️.
  Zero uses 💤.
  infinity uses ♾️ .
  NaN uses ❓ .
  */
  window.formatArin = function formatArin(decimalIn, precision = 2) {
    const dec = toDecimal(decimalIn);

    if (dec.sign === 0) return "💤";
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "❓";
    if (dec.sign < 0) return "🌑" + formatArin(dec.neg(), precision);
    if (dec.mag === Number.POSITIVE_INFINITY) return "♾️";

    const isSmall = dec.lt(1);
    if (isSmall) return "🌬️" + formatArin(dec.recip(), precision)

    // Normal State — (x)
    if (dec.lt(6.18)) return dec.toStringWithDecimalPlaces(precision);

    // 🌙 Moon State
    const moon = dec.sub(6.18);
    if (moon.lt(6.18)) return "🌙" + moon.toStringWithDecimalPlaces(precision);

    // ⭐ Star State
    const star = moon.div(6.18);
    if (star.lt(6.18)) return "⭐" + star.toStringWithDecimalPlaces(precision);

    // 💫 Shooting Star State
    const shoot = star.log(6.18);
    if (shoot.lt(6.18)) return "💫" + shoot.toStringWithDecimalPlaces(precision);

    // 👑 Crown State
    const crown = slog(shoot, 6.18);
    return "👑" + formatArin(crown, precision);
  };

  // Alphabet cache
  const alphabetCache = new Map();

  // Fast alphabet splitter
  function getAlphabetArray(alphabet) {
    if (Array.isArray(alphabet)) return alphabet;

    const key = String(alphabet);
    let cached = alphabetCache.get(key);
    if (cached) return cached;

    // ASCII-safe fast path
    const arr = /^[a-zA-Z0-9@]+$/.test(key)
      ? key.split("")
      : Array.from(key);

    alphabetCache.set(key, arr);
    return arr;
  }

  // Optimized bijectiveLetters — lower constants, safer for large n
  function bijectiveLetters(nInput, alphaInput) {
    // Fast rejects & normalization
    if (nInput == null) return "";
    let n = typeof nInput === "number" ? nInput : Number(nInput);
    if (!Number.isFinite(n) || n <= 0) return "";

    n = Math.floor(n);
    const glyphs = getAlphabetArray(alphaInput);
    const base = glyphs.length;
    if (base === 0) return "";

    // Unary alphabet quick path
    if (base === 1) {
      return n <= 1000 ? glyphs[0].repeat(n) : glyphs[0] + "×" + n;
    }

    // Hard bailout for absurdly large numbers (keeps behavior consistent)
    if (n > 1e15) {
      return glyphs[0] + "×" + n.toExponential(2);
    }

    // Estimate output length to preallocate buffer (avoids reverse())
    // length ≈ floor(log_base((n-1) * (base-1) + 1)) + 1  — safe overestimate
    const estLen = Math.max(1, Math.floor(Math.log((n - 1) * (base - 1) + 1) / Math.log(base)) + 1);
    const out = new Array(estLen);
    let writeIndex = estLen; // we'll fill from the end

    while (n > 0) {
      n -= 1; // bijective adjustment
      const digit = n % base;
      writeIndex -= 1;
      out[writeIndex] = glyphs[digit];
      n = Math.floor(n / base);
    }

    // join only the filled region
    return out.slice(writeIndex).join("");
  }

  // attach to window
  window.bijectiveLetters = bijectiveLetters;

  window.minNumForBijectiveLength = function minNumForBijectiveLength(length, base) {
    const lengthD = toDecimal(length);
    const baseD = toDecimal(base);
    return baseD.pow(lengthD).sub(1).div(baseD.sub(1));
  }

  window.getBijectiveLength = function getBijectiveLength(num, base) {
    const numD = toDecimal(num);
    const baseD = toDecimal(base);
    return numD.sub(1).mul(baseD.sub(1)).add(baseD).log(baseD)
  }

  /* Letters notation, which was popularized by Antimatter Dimensions but was used in some variety in several incremental games beforehand, is similar to Standard notation in that it splits a number into a power of 1,000 and a coefficient on that power, but whereas Standard uses abbreviated versions of the names "thousand", "million", "billion", and so on, Letters uses lowercase letters in order: a for 103, b for 106, c for 109, d for 1012, and so on. For example, 20,500 is 20.5a, and 593,000,000 is 593b.
The system keeps going after z: the next power of 1,000 after z uses aa, then next is ab, then ac, then ad, and so on. ba comes after az, then bb, then bc, and so on. After zz is aaa, after zzz is aaaa, and so on. This means that the powers of 1,000 are written in a "bijective base 26" with letters as the digits.
Having a bunch of lowercase letters is as far as the notation goes elsewhere, but Eternal Notations goes much further. Once there are too many letters, the notation switches to a number with a single uppercase A, where the uppercase A indicates that the number represents how many lowercase letters would be in the expression if it was fully expanded without the A: for example, 50A means 1aaaaaaa... with 50 a's. For fractional numbers with an uppercase A, you can think of the fraction as the logarithmic distance from one amount of letters to the next: for example, 14.5A means "halfway between 14A and 15A", which is around 1fcoyj... with 14 letters in there. Once the number with the A gets over 1,000, the lowercase letters return: for example, 20Ab means 1aaaaa... with 20b = 20,000,000 a's. An uppercase B indicates that the number represents the amount of lowercase letters in an expression with an uppercase A: for example, 500B means 1Aaaaaaa... with 500 a's. Likewise, an uppercase C means the number is the amount of lowercase letters in a B expression, a D means the number is the amount of lowercase letters in a C expression, and so on; each uppercase letter is two power-tower layers higher than the previous one. Like the lowercase letters, the uppercase letter after Z is AA, then AB is next, then AC, and so on, with BA after AZ, AAA after ZZ, and so on. Finally, once there's too many uppercase letters to show, you get an expression with an @, where the number indicates the amount of uppercase letters that would be in the expression: for example, 32@ means 1AAAA... with 32 A's.
*/
  window.formatLetters = function formatLetters(decimalIn, precision = 2, alphabet) {
    let dec = toDecimal(decimalIn);

    // Basic validation & sign handling (mirrors other formatters)
    if (dec.sign === 0) return dec.toStringWithDecimalPlaces(precision);
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "NaN";
    if (dec.sign < 0) return "-" + formatLetters(dec.neg(), precision, alphabet);
    if (dec.mag === Number.POSITIVE_INFINITY) return "Infinity";

    if (dec.layer === 0 && Math.abs(dec.mag) < SAFE_NUM_MAG) {
      const n = dec.mag * Math.sign(dec.sign);
      if (n >= 1000) return addCommas(n.toLocaleString(undefined, { maximumFractionDigits: 0 }));
      if (n < 10 ** -precision) {
        // continue to next section for small numbers in standard notation
      }
      else return n.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    }

    // Config
    const max_letters = 7;                // max letters before promoting tier
    const lowercaseAlphabet = String(alphabet ? alphabet[0] : "abcdefghijklmnopqrstuvwxyz");
    const uppercaseAlphabet = String(alphabet ? alphabet[1] : "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    const thirdAlphabet = String(alphabet ? alphabet[2] : "@");
    const base = [...lowercaseAlphabet].length; // normally 26
    const letterBase = 1000; // normally 1000
    const isSmall = dec.lt(1);

    // Determine number of letters needed
    const value = isSmall ? dec.recip() : dec;
    const upperLetter = slog10(value).sub(slog10(minNumForBijectiveLength(max_letters + 1, base).mul(Math.log10(letterBase)))).add(1).div(2).floor()
    const thirdLetter = getBijectiveLength(upperLetter, base)

    if (thirdLetter.floor().gt(max_letters)) {
      let magString = thirdLetter.toStringWithDecimalPlaces(precision)
      return magString + (isSmall ? "/" : " ") + thirdAlphabet
    }
    else {
      let [mag, letter] = scientifify(dec, letterBase);
      if (isSmall) letter = letter.neg()

      if (upperLetter.gt(0)) {
        const getLetter = scientifify(slogsub(value, upperLetter.sub(1).mul(2)), letterBase)[1];
        [mag, letter] = scientifify(getBijectiveLength(getLetter, base), letterBase)
      }

      let magString = mag.toStringWithDecimalPlaces(precision);
      if (magString == letterBase) {
        magString = dOne.toStringWithDecimalPlaces(precision);
        letter = letter.add(dOne);
      }

      let lowerString = bijectiveLetters(letter.toNumber(), lowercaseAlphabet);
      let upperString = bijectiveLetters(upperLetter.toNumber(), uppercaseAlphabet);

      return magString + (isSmall ? "/" : " ") + upperString + lowerString
    }
  }

  window.formatStandard = function formatStandard(decimalIn, precision = 2, scale = "short") {
    const dec = toDecimal(decimalIn);

    if (dec.sign === 0) return dec.toStringWithDecimalPlaces(precision);
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "NaN";
    if (dec.sign < 0) return "-" + formatStandard(dec.neg(), precision);
    if (dec.mag === Number.POSITIVE_INFINITY) return "Infinity";

    if (dec.gte("eee3e45") || dec.lte("eee-3e45")) { // limit of standard notation formatting
      return tetrationalFormat(dec, precision, "Standard");
    }

    if (dec.layer === 0 && Math.abs(dec.mag) < SAFE_NUM_MAG) {
      const n = dec.mag * Math.sign(dec.sign);
      if (n >= 1000) return addCommas(n.toLocaleString(undefined, { maximumFractionDigits: 0 }));
      if (n < 10 ** -precision) {
        // continue to next section for small numbers in standard notation
      }
      else return n.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    }

    const isSmall = dec.lt(1);
    const isLong = scale === "long";

    let t1illion_num = isLong ? dec.log10().div(6).floor() : dec.log10().div(3).sub(1).floor(); // sub 1 because thousand is 0 illion
    let mant = dec.div(pow10(isLong ? t1illion_num.mul(6) : t1illion_num.add(1).mul(3))); // mant is the "number" part before illion (ex: the 1.23 in 1.23 million)
    if (mant.toStringWithDecimalPlaces(precision) == (isLong ? 1000000 : 1000)) { // handle rounding edge case like "1000 million" or "1000000 million (long)"
      mant = dOne;
      t1illion_num = t1illion_num.add(dOne);
    }

    if (isSmall) t1illion_num = t1illion_num.neg().sub(isLong ? 0 : 2)
    let t2illion_num = t1illion_num.log10().div(3).floor();
    let t3illion_num = t2illion_num.log10().div(3).floor();
    let t4illion_num = t3illion_num.log10().div(3).floor();

    const mantString = (t1illion_num.gte(1e12) ? 1 : mant.toNumber()).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }) // 1e12 t1illion (dec = 10^(3e12 + 3)) and above always show mant as 1

    // tier 1 and 2 illions are formed with order: ones, tens, hundreds
    // tier 3 illions are formed in the opposite order: hundreds, tens, ones 
    if (t1illion_num.lt(1e3)) {
      return mantString + (isSmall ? "/" : " ") + makeIllion(1, t1illion_num.toNumber());
    }

    if (t2illion_num.lt(1e3)) {
      let illion = "";
      for (let i = t2illion_num.toNumber(), count = 0; i > 0 && count < 4; i--, count++) {
        const mod1000 = Math.floor(t1illion_num.div(Decimal.pow(1e3, i)).toNumber()) % 1000
        if (mod1000 > 0) illion += (illion === "" ? "" : "-") + makeIllion(2, i, mod1000);
      }
      if (t1illion_num.toNumber() % 1000 > 0 && t2illion_num.toNumber() < 4) illion += (illion === "" ? "" : "-") + makeIllion(1, t1illion_num.toNumber() % 1000)
      return mantString + (isSmall ? "/" : " ") + illion;
    }

    if (t3illion_num.lt(1e3)) {
      let illion = "";
      for (let i = t3illion_num.toNumber(), count = 0; i > 0 && count < 4; i--, count++) {
        const mod1000 = Math.floor(t2illion_num.div(Decimal.pow(1e3, i)).toNumber()) % 1000
        if (mod1000 > 0) illion += (illion === "" ? "" : "a'") + makeIllion(3, i, mod1000);
      }
      if (t2illion_num.toNumber() % 1000 > 0 && t3illion_num.toNumber() < 4) illion += (illion === "" ? "" : "a'") + makeIllion(2, t2illion_num.toNumber() % 1000)
      return mantString + (isSmall ? "/" : " ") + illion;
    }

    let illion = "";
    for (let i = t4illion_num.toNumber(), count = 0; i > 0 && count < 4; i--, count++) {
      const mod1000 = Math.floor(t3illion_num.div(Decimal.pow(1e3, i)).toNumber()) % 1000
      if (mod1000 > 0) illion += (illion === "" ? "" : "`") + makeIllion(4, i, mod1000);
    }
    if (t3illion_num.toNumber() % 1000 > 0 && t4illion_num.toNumber() < 4) illion += (illion === "" ? "" : "`") + makeIllion(3, t3illion_num.toNumber() % 1000, 1, true)
    return mantString + (isSmall ? "/" : " ") + illion;

  }

  window.makeIllion = function makeIllion(tier, index, mult = 1, isT4Add = false) {
    if (tier < 1) return ""; // no illion
    if (tier === 1 && index === 0) return "K" // thousand special case
    let tierIndex = tier - 1;
    let multName = makeIllionMult(tierIndex, mult);
    if (tierIndex === 3) { // tier 4
      let illionName = "";
      const t4add = mult === 1 ? tier4adds[index] : multName;
      illionName = t4add + illions[3][index];
      return illionName;
    }
    if (index < 10 && !isT4Add) return multName + illions[tierIndex][index]
    if (tierIndex === 2) { // tier 3
      let illionName = "";
      const t3mod100 = index % 100;
      let t3TO // tens and ones
      if (t3mod100 >= 10 && t3mod100 < 20) {
        t3TO = tier3teens[t3mod100 - 10];
      } else {
        t3TO = (t3mod100 < 20 ? "" : tens[2][Math.floor(index / 10) % 10] + tier3adds[index % 10]) + ones[2][index % 10];
      }
      illionName = hundreds[2][Math.floor(index / 100)] + (t3mod100 === 0 ? "T" : "") + t3TO
      return illionName;
    }

    let ot // ones and tens
    if (tierIndex === 1 && index % 100 === 10) ot = "Quc" // tier 2 and index 10
    else ot = ones[tierIndex][index % 10] + tens[tierIndex][Math.floor(index / 10) % 10];
    let illionName = "";
    illionName = ot + hundreds[tierIndex][Math.floor(index / 100)];
    return multName + illionName;
  }

  window.makeIllionMult = function makeIllionMult(tier, index) {
    if (tier < 1 || index === 1) return ""; // no illion for x1 multiplier
    let tierIndex = tier - 1;
    if (tierIndex === 2) { // tier 3
      const t3mults = ["", "", "D", "Tr", "T", "P", "Ex", "Z", "Y", "N"]
      let illionName = "";
      const t3mod100 = index % 100;
      let t3TO // tens and ones
      if (t3mod100 >= 10 && t3mod100 < 20) {
        t3TO = tier3teens[t3mod100 - 10];
      } else {
        t3TO = (t3mod100 < 20 ? "" : tens[2][Math.floor(index / 10) % 10] + tier3adds[index % 10]) + (index < 10 ? t3mults[index % 10] : ones[2][index % 10]);
      }
      illionName = hundreds[2][Math.floor(index / 100)] + (t3mod100 === 0 ? "T" : "") + t3TO
      return illionName;
    }
    let ot // ones and tens
    if (tierIndex === 1 && index % 100 === 10) ot = "Quc" // tier 2 and index 10
    else ot = (tierIndex === 1 && index < 10 ? illions[tierIndex][index] : ones[tierIndex][index % 10]) + tens[tierIndex][Math.floor(index / 10) % 10];
    let illionName = "";
    illionName = ot + hundreds[tierIndex][Math.floor(index / 100)];
    return illionName;
  }

  window.formatLog = function formatLog(decimalIn, precision = 2, notation = "Logarithm") {
    const dec = toDecimal(decimalIn);

    if (dec.sign === 0) return dec.toStringWithDecimalPlaces(precision);
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "NaN";
    if (dec.sign < 0) return "-" + formatLog(dec.neg(), precision, notation);
    if (dec.mag === Number.POSITIVE_INFINITY) return "Infinity";

    const isLong = notation.includes("Long Scale");
    const lim = isLong ? 1e60 : 1e33

    if (notation.startsWith("Mixed") && dec.lt(lim) && dec.gt(1 / lim)) { return formatStandard(dec, precision, isLong ? "long" : "short"); }

    if (dec.layer === 0 && Math.abs(dec.mag) < SAFE_NUM_MAG) {
      const n = dec.mag * Math.sign(dec.sign);
      if (n >= 1000) return addCommas(n.toLocaleString(undefined, { maximumFractionDigits: 0 }));
      if (n < 10 ** -precision) {
        // continue to next section for small numbers in log notation
      }
      else return n.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    }

    const isSmall = dec.lt(1);
    const slog = slog10(isSmall ? dec.recip() : dec)
    const numberOfEs = Math.max(slog.floor().toNumber() - 1, 1)
    const mag = slogsub(isSmall ? dec.recip() : dec, numberOfEs).toNumber().toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })
    if (numberOfEs > 5) return (isSmall ? "e-(e^" + (numberOfEs - 1) + ")" : "(e^" + numberOfEs + ")") + mag;
    return (isSmall ? "e-" + "e".repeat(numberOfEs - 1) : "e".repeat(numberOfEs)) + mag;
  }

  window.formatSciEng = function formatSciEng(decimalIn, precision = 2, notation = "Scientific") {
    const dec = toDecimal(decimalIn);

    if (dec.sign === 0) return dec.toStringWithDecimalPlaces(precision);
    if (isNaN(dec.sign) || isNaN(dec.layer) || isNaN(dec.mag)) return "NaN";
    if (dec.sign < 0) return "-" + formatSciEng(dec.neg(), precision, notation);
    if (dec.mag === Number.POSITIVE_INFINITY) return "Infinity";

    const isLong = notation.includes("Long Scale");
    const lim = isLong ? 1e60 : 1e33

    if (notation.startsWith("Mixed") && dec.lt(lim) && dec.gt(1 / lim)) { return formatStandard(dec, precision, isLong ? "long" : "short"); }

    if (dec.layer === 0 && Math.abs(dec.mag) < SAFE_NUM_MAG) {
      const n = dec.mag * Math.sign(dec.sign);
      if (n >= 1000) return addCommas(n.toLocaleString(undefined, { maximumFractionDigits: 0 }));
      if (n < 10 ** -precision) return exponentialFormat(dec, precision, notation);
      return n.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    }

    const isLayer3 = dec.layer > 3 || (dec.mag >= 1e10 && dec.layer === 3);
    const isLayer2 = dec.layer > 2 || (Math.abs(dec.mag) > 100 && dec.layer === 2);
    const isLayer1 = dec.layer > 1 || (Math.abs(dec.mag) >= SAFE_NUM_MAG && dec.layer === 1);
    const isLayer0 = dec.layer > 0 || dec.mag >= SAFE_NUM_MAG;

    if (isLayer3) {
      return tetrationalFormat(dec, precision, notation);
    }

    if (isLayer2 || isLayer1) return `e${format(dec.log10(), isLayer2 ? precision : precision + 2)}`;
    if (isLayer0) return exponentialFormat(dec, precision, notation);
    return regularFormat(dec, precision);
  };

  window.formatWhole = function formatWhole(decimalIn, notation = options.notation ? options.notation : "Scientific") {
    const dec = toDecimal(decimalIn);
    const absMag = Math.abs(dec.mag);
    if (absMag >= SAFE_NUM_MAG || dec.layer > 0) return format(dec, 2, notation);
    if (absMag < 1 && !dec.eq(0)) return format(dec, 2, notation);
    return format(dec, (notation === "YooA" || notation === "Arin" ? 2 : 0), notation);
  };

  window.formatTime = function formatTime(sIn, precision = 2, notation = options.notation ? options.notation : "Scientific") {
    const s = toDecimal(sIn);
    if (s.layer === 0 && s.mag < 1e15) {
      const n = s.mag;
      if (n >= 31556952000) return `${format(s.div(31556952), precision, notation)}y`;
      if (n < 60) return `${format(n, precision, notation)}s`;
      if (n < 3600) return `${formatWhole(Math.floor(n / 60), notation)}m ${format(n % 60, precision, notation)}s`;
      if (n < 86400) return `${formatWhole(Math.floor(n / 3600), notation)}h ${formatWhole(Math.floor(n / 60) % 60, notation)}m ${format(n % 60, precision, notation)}s`;
      if (n < 31536000) return `${formatWhole(Math.floor(n / 86400) % 365, notation)}d ${formatWhole(Math.floor(n / 3600) % 24, notation)}h ${formatWhole(Math.floor(n / 60) % 60, notation)}m ${format(n % 60, precision, notation)}s`;
      return `${formatWhole(Math.floor(n / 31536000), notation)}y ${formatWhole(Math.floor(n / 86400) % 365, notation)}d ${formatWhole(Math.floor(n / 3600) % 24, notation)}h ${formatWhole(Math.floor(n / 60) % 60, notation)}m ${format(n % 60, precision, notation)}s`;
    }
    if (s.gte(31556952000)) return `${format(s.div(31556952), precision, notation)}y`;
    if (s.lt(60)) return `${format(s, precision, notation)}s`;
    if (s.lt(3600)) return `${formatWhole(s.div(60), notation)}m ${format(s.mod(60), precision, notation)}s`;
    if (s.lt(86400)) return `${formatWhole(s.div(3600), notation)}h ${formatWhole(s.div(60).mod(60), notation)}m ${format(s.mod(60), precision, notation)}s`;
    if (s.lt(31536000)) return `${formatWhole(s.div(86400).mod(365), notation)}d ${formatWhole(s.div(3600).mod(24), notation)}h ${formatWhole(s.div(60).mod(60), notation)}m ${format(s.mod(60), precision, notation)}s`;
    return `${formatWhole(s.div(31536000), notation)}y ${formatWhole(s.div(86400).mod(365), notation)}d ${formatWhole(s.div(3600).mod(24), notation)}h ${formatWhole(s.div(60).mod(60), notation)}m ${format(s.mod(60), precision, notation)}s`;
  };

  window.toPlaces = function toPlaces(xIn, precision = 2, maxAccepted = Infinity) {
    const x = toDecimal(xIn);
    let result = x.toStringWithDecimalPlaces(precision);
    const rdec = toDecimal(result);
    if (rdec.gte(maxAccepted)) {
      result = toDecimal(maxAccepted).sub(D.pow(10, -precision)).toStringWithDecimalPlaces(precision);
    } 
    return result;
  };

  window.formatSmall = function formatSmall(x, precision = 2) {
    return format(x, precision);
  };

  // invertOOM — optimized Decimal math
  window.invertOOM = function invertOOM(xIn) {
    const x = toDecimal(xIn);
    const e = x.log10().ceil();
    const m = x.div(pow10(e));
    const negE = e.neg();
    return pow10(negE).times(m);
  };

  // 🌸 YooA's GPU-Accelerated Glow (AD-grade)
  window.colorText = function colorText(elem, color, text) {
    return `<${elem} class="yooa-glow" style="color:${color};">${text}</${elem}>`;
  };

  // formatGain — optimized mostly numeric path & reuses format()
  window.formatGain = function formatGain(aIn, eIn, FPS, percent = false, DT = tet10(10)) {
    const a = toDecimal(aIn);
    const e = toDecimal(eIn);
    const g = a.add(e.div(FPS));

    if (!g.eq(a) || percent) {
      if (a.gte(DT)) {
        const oom = slog10(g).sub(slog10(a)).mul(FPS);
        if (oom.gte(1e-3)) return `(+${format(oom)} OoMs^^2/s)`;
      }
      if (a.gte("ee100")) {
        const tower = Math.floor(slog10(a).toNumber() - 1.3010299956639813);
        const oom = slogsub(g, tower).sub(slogsub(a, tower)).mul(FPS);
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

  window.slogsub = function slogsub(n, sub) { return tet10(slog10(n).sub(sub)); };

  window.tet10 = function tet10(numIn) {
    const num = toDecimal(numIn);
    if (num.lt(-2)) return D.dNaN;
    const numFloor = num.floor();
    let result = pow10(num.sub(numFloor));
    result.layer = numFloor.toNumber();
    return norm(result);
  };

  window.logBase = function logBase(numIn, baseIn) { // uses Number
    return Math.log(numIn) / Math.log(baseIn);
  }

  window.slogNum = function slogNum(numIn, baseIn) { // uses Number
    // Special cases:
    if (baseIn <= 0 || baseIn === 1) {
      return NaN;
    }

    // Handle small or wobbling bases
    if (baseIn < 1) {
      if (numIn === 1) {
        return 0;
      }
      if (numIn === 0) {
        return -1;
      }
      return NaN;
    }

    // Handle log of 0 or negative numbers
    if (numIn === 1) {
      return -1;
    }

    let slog = -1;
    while (numIn >= 1) {
      numIn = logBase(numIn, baseIn);
      slog++
    }
    return slog + numIn;
  }

  window.slog10 = function slog10(numIn) {
    const num = toDecimal(numIn);
    const m = num.mag;
    const slogmag = m < 10 ? Math.log10(m) : (m < 1e10 ? 1 + Math.log10(Math.log10(m)) : 2 + Math.log10(Math.log10(Math.log10(m))));
    return new Decimal(num.layer + slogmag);
  };

  window.slog = function slog(numIn, baseIn) {
    const base = toDecimal(baseIn);
    let num = toDecimal(numIn);
    const numLayer = num.layer;
    num.layer = 2;
    let slog = numLayer - 2;

    while (num.gte(1)) {
      num = num.log(base);
      slog++;
    }
    const m = num.mag;

    const slogmag = slogNum(m, base);

    // match the same return pattern as your slog10 (layer + slogmag)
    return new Decimal(slog + slogmag);
  };

  const FIRST_NEG_LAYER = 1 / 9e15;
  const EXP_LIMIT = 9e15;
  const LAYER_DOWN = Math.log10(9e15);

  window.norm = function norm(numIn) {
    const num = toDecimal(numIn);
    if (num.sign === 0 || (num.mag === 0 && num.layer === 0)) {
      num.sign = 0; num.mag = 0; num.layer = 0; return num;
    }
    if (!isFinite(num.mag) || !isFinite(num.layer)) return D.dInf;

    if (num.layer === 0 && num.mag < FIRST_NEG_LAYER) {
      num.layer = 1; num.mag = Math.log10(num.mag); return num;
    }

    let absmag = Math.abs(num.mag);
    let signmag = Math.sign(num.mag);

    if (absmag >= EXP_LIMIT) {
      num.layer++;
      num.mag = signmag * Math.log10(absmag);
      return num;
    }

    while (absmag < LAYER_DOWN && num.layer > 0) {
      num.layer--;
      if (num.layer === 0) num.mag = Math.pow(10, num.mag);
      else {
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
    if (Number.isNaN(num.sign) || Number.isNaN(num.layer) || Number.isNaN(num.mag)) {
      num.sign = NaN; num.mag = NaN; num.layer = NaN;
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
    const scaleAtoms = ["atoms", "viruses", "bacteria", "cells", "grains of sand", "pennies", "baseballs", "YooAs", "elephants", "blue whales", "Great Pyramids of Giza", "large asteroids", "atmospheres", "Earths", "Jupiters", "Suns", "star clusters", "galaxies", "large galactic superclusters", "observable universes", "completely filled galaxies", "completely filled galaxy groups", "completely filled galactic superclusters", "completely filled observable universes"];
    const scaleAtomValues = [1, 251e5, 100369e6, 100369e9, 30408e14, 2306e19, 146036e20, 442583e22, 32118e25, 15055e27, 602215e30, 40216e37, 21205e40, 1.33e50, 65074e49, 681697e51, 3428e58, 78395e64, 6817e70, 1e80, 4.564e90, 6916e94, 4841e98, 4703e106];
    const scaleHeights = ["hydrogen atoms", "wavelengths of green light", "grains of sand", "pieces of paper", "YooAs", "American football fields", "Burj Khalifas", "Mount Everests", "the altitude of the International Space Station", "Earths", "the distance from the Earth to the Moon", "the distance from the Earth to the Sun", "the distance from the Sun to Neptune", "the distance from the Sun to Proxima Centauri", "galaxies", "galactic superclusters", "observable universes"];
    const scaleHeightValues = [5.6692908e-8, 0.000125787444, 0.11811024, 66, 378, 21600, 32598.43, 2090281.8, 98622e3, 3009921e3, 9094488e4, 3533808e7, 10626162e8, 9430902e12, 195348e18, 11621016e18, 44919702e19, 2094018e23];

    if (s.lt("e1000")) {
      let id2 = scaleValues.findIndex(value => s.lt(value)) - 1;
      if (id2 === -2) id2 = scaleValues.length - 1;
      const mag = s.div(scaleValues[id2]);
      return `If every YooA Point is a litre of water, you could fill ${format(mag)} ${scaleNames[id2]}.`;
    }
    if (s.lt(tet10(66))) {
      if (s.invFac().lt(100369e9)) {
        s = s.log2()
        let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleTimeValues.length - 1;
        const mag = s.div(scaleTimeValues[id2]);
        return `If you started with a single bacterium and the bacterium split in two every second, then with unlimited space and resources, it would take ${format(mag)} ${scaleTimes[id2]} for the colony to reach a population equal to your YooA Points.`;
      }

      s = s.invFac();
      if (s.lt(Decimal.pow(2, 420))) {
        let id2 = scaleAtomValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleAtomValues.length - 1;
        const mag = s.div(scaleAtomValues[id2]);
        return `Your YooA Points is equal to the number of ways to rearrange all of the atoms in ${format(mag)} ${scaleAtoms[id2]}.`;
      }

      if (s.invFac().lt(100369e9)) {
        s = s.log2()
        let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleTimeValues.length - 1;
        const mag = s.div(scaleTimeValues[id2]);
        return `If you started with a single bacterium and the bacterium split in two every second, then with unlimited space and resources, if you let it grow for ${format(mag)} ${scaleTimes[id2]}, the number of ways to rearrange all of the bacteria in the colony would be equal to your YooA Points.`;
      }

      s = s.invFac();
      if (s.lt(Decimal.pow(2, 420))) {
        let id2 = scaleAtomValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleAtomValues.length - 1;
        const mag = s.div(scaleAtomValues[id2]);
        return `If you recorded the number of ways to rearrange all of the atoms in ${format(mag)} ${scaleAtoms[id2]}, then the number of ways to rearrange that set of rearrangements would be equal to your YooA Points.`;
      }

      if (s.invFac().lt(100369e9)) {
        s = s.log2()
        let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleTimeValues.length - 1;
        const mag = s.div(scaleTimeValues[id2]);
        return `If you started with a single bacterium and the bacterium split in two every second, then with unlimited space and resources, if you let it grow for ${format(mag)} ${scaleTimes[id2]}, then you recorded every single way to rearrange all of the bacteria in the colony, the number of ways to rearrange that set of rearrangements would be equal to your YooA Points.`;
      }

      s = s.invFac();
      if (s.lt(Decimal.pow(2, 420))) {
        let id2 = scaleAtomValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleAtomValues.length - 1;
        const mag = s.div(scaleAtomValues[id2]);
        return `If you recorded every single way to rearrange all of the atoms in ${format(mag)} ${scaleAtoms[id2]}, then recorded every way to rearrange that set of rearrangements, then recorded every way to rearrange THAT set, the size of the final resulting set would be equal to your YooA Points.`;
      }

      if (s.invFac().lt(100369e9)) {
        s = s.log2()
        let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleTimeValues.length - 1;
        const mag = s.div(scaleTimeValues[id2]);
        return `If you started with a single bacterium and the bacterium split in two every second, then with unlimited space and resources, if you let it grow for ${format(mag)} ${scaleTimes[id2]}, then you recorded every single way to rearrange all of the bacteria in the colony, then recorded every way to rearrange that set of rearrangements, then recorded every way to rearrange THAT set, the size of the final resulting set would be equal to your YooA Points.`;
      }

      let times = slog10(s.invFac()).sub(slog10(new Decimal(100369e9))).floor().add(1)
      let timesText = formatWhole(times, options.notation ? options.notation : "Scientific") + " more time" + (times.eq(1) ? "" : "s")
      s = slogsub(s, times.sub(1))
      s = s.invFac();
      if (s.lt(Decimal.pow(2, 420))) {
        let id2 = scaleAtomValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleAtomValues.length - 1;
        const mag = s.div(scaleAtomValues[id2]);
        return `If you recorded every single way to rearrange all of the atoms in ${format(mag)} ${scaleAtoms[id2]}, then recorded every way to rearrange that set of rearrangements, then recorded every way to rearrange THAT set, and repeat that step ${timesText}, the size of the final resulting set would be equal to your YooA Points.`;
      }

      if (s.invFac().lt(100369e9)) {
        s = s.log2()
        let id2 = scaleTimeValues.findIndex(value => s.lt(value)) - 1;
        if (id2 === -2) id2 = scaleTimeValues.length - 1;
        const mag = s.div(scaleTimeValues[id2]);
        return `If you started with a single bacterium and the bacterium split in two every second, then with unlimited space and resources, if you let it grow for ${format(mag)} ${scaleTimes[id2]}, then you recorded every single way to rearrange all of the bacteria in the colony, then recorded every way to rearrange that set of rearrangements, then recorded every way to rearrange THAT set, and repeat that step ${timesText}, the size of the final resulting set would be equal to your YooA Points.`;
      }
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

  // Softcap & scale text helpers (YooA flavored)
  window.softcapText = function softcapText(text, tooltipText = '🌸 YooA says... "This stat has been softcapped! 🎶"\nSoftcap means its growth slows down beyond this point to keep the balance magical! ✨🧮') {
    return `<span class="softcapped">${text}<span class="tooltip">${tooltipText}</span></span>`;
  };

  window.scaleText = function scaleText(text, type = 'blooming', tooltipText = '🌸 YooA exclaims… "Scaling enchantment unleashed! 🎶"\n‘Tis a surge in cost growth beyond this point, to match your ever-expanding power! ✨🔢') {
    const cls = ['scaled', type.toLowerCase()].join(' ');
    return `<span class="${cls}">${text}<span class="tooltip">${tooltipText}</span></span>`;
  };

  // expose a small performance hint function (optional)
  window._formatHelpers = {
    isDecimalLike,
    toDecimal,
    SAFE_NUM_MAG
  };

  // End IIFE
})();
