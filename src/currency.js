// currency.js
// Free, no-key, no-rate-limit JSON via jsDelivr (fawazahmed0 exchange/currency project).
// Correct CDN path (note the @latest/npm path): 
// https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json

(() => {
    // --------------------------
    // CONFIG
    // --------------------------
    const FX_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
    // Refresh interval in ms (15 minutes). Safe for CDN static JSON; adjust if desired.
    const REFRESH_INTERVAL_MS = 1000 * 60 * 15;

    const LS_KEY_RATES = "yemm_fx_rates";
    const LS_KEY_TS = "yemm_fx_rates_ts";

    // --------------------------
    // REQUIRE Decimal
    // --------------------------
    if (typeof Decimal === "undefined") {
        console.error("currency.js requires Decimal to be loaded first.");
        return;
    }
    const D = Decimal;
    const dOne = D.dOne || new Decimal(1);

    // --------------------------
    // initial/hardcoded rates (Decimal instances)
    // --------------------------
    window.currencyRates = {
        USD: dOne,
        EUR: new Decimal(0.91),
        PHP: new Decimal(58.4),
        JPY: new Decimal(158.2),
        KRW: new Decimal(1360),
    };

    // --------------------------
    // UTILITIES
    // --------------------------
    function normalizeCode(code) {
        if (!code) return "";
        return String(code).trim().toUpperCase();
    }

    function saveCachedRates(ratesObj) {
        try {
            const plain = {};
            for (const [k, v] of Object.entries(ratesObj)) {
                plain[k] = (v instanceof Decimal) ? v.toNumber() : Number(v);
            }
            localStorage.setItem(LS_KEY_RATES, JSON.stringify(plain));
            localStorage.setItem(LS_KEY_TS, Date.now().toString());
        } catch (e) {
            console.warn("Could not cache FX rates:", e);
        }
    }

    function loadCachedRates() {
        try {
            const raw = localStorage.getItem(LS_KEY_RATES);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            const out = {};
            for (const [k, v] of Object.entries(obj)) out[normalizeCode(k)] = new Decimal(v);
            return out;
        } catch (e) {
            console.warn("Failed to load cached FX rates:", e);
            return null;
        }
    }

    function mergeRates(plainRates) {
        if (!plainRates || typeof plainRates !== "object") return;
        for (const [kRaw, v] of Object.entries(plainRates)) {
            const k = normalizeCode(kRaw);
            if (!k) continue;
            try {
                const d = new Decimal(v);
                window.currencyRates[k] = d;
            } catch (e) {
                console.warn("Invalid FX value for", k, v, e);
            }
        }
    }

    // Try to extract rates from multiple possible JSON shapes
    function extractRatesFromResponse(data) {
        if (!data || typeof data !== "object") return null;
        if (data.rates && typeof data.rates === "object") return data.rates;
        if (data.usd && typeof data.usd === "object") return data.usd;
        // fallback: find first object with numeric values
        for (const val of Object.values(data)) {
            if (val && typeof val === "object") {
                const keys = Object.keys(val);
                if (keys.length && typeof val[keys[0]] === "number") return val;
            }
        }
        return null;
    }

    // --------------------------
    // CORE: refreshFX with robust checks
    // --------------------------
    async function refreshFX() {
        try {
            const res = await fetch(FX_URL, { cache: "no-store" });

            // check HTTP status
            if (!res.ok) {
                console.warn(`FX fetch returned HTTP ${res.status} ${res.statusText}. Using cached/hardcoded rates.`);
                const cached = loadCachedRates();
                if (cached) {
                    mergeRates(cached);
                    console.log("Loaded cached FX rates after HTTP error.");
                }
                return;
            }

            // check Content-Type before parsing JSON (defensive)
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json") && !contentType.includes("text/json")) {
                // server may respond with plain text error; read it for debug but don't attempt json parse
                const text = await res.text();
                console.warn("FX fetch returned non-JSON content. Response text:", text);
                const cached = loadCachedRates();
                if (cached) {
                    mergeRates(cached);
                    console.log("Loaded cached FX rates after non-JSON response.");
                }
                return;
            }

            // safe JSON parse
            const data = await res.json();
            const ratesObj = extractRatesFromResponse(data);

            if (!ratesObj) {
                console.warn("Currency JSON did not contain a rates object. Using cached/hardcoded rates. Response:", data);
                const cached = loadCachedRates();
                if (cached) {
                    mergeRates(cached);
                    console.log("Loaded cached FX rates into window.currencyRates");
                }
                return;
            }

            // normalize and merge (values expected as number: 1 USD => rate)
            const normalized = {};
            for (const [k, v] of Object.entries(ratesObj)) {
                if (v == null) continue;
                const num = Number(v);
                if (!Number.isFinite(num)) continue;
                normalized[normalizeCode(k)] = num;
            }

            mergeRates(normalized);
            saveCachedRates(window.currencyRates);
            console.log("FX updated successfully!", window.currencyRates);
            // at the end of refreshFX() after console.log("FX updated successfully!", ...);
            try { window.dispatchEvent(new CustomEvent('_yemm_fx_updated')); } catch(e) {}

        } catch (err) {
            // catch network / parse errors
            console.warn("Failed to fetch FX JSON — using cached/hardcoded rates. Error:", err);
            const cached = loadCachedRates();
            if (cached) {
                mergeRates(cached);
                console.log("Loaded cached FX rates into window.currencyRates after fetch error");
            }
        }
    }

    // --------------------------
    // SYMBOL MAP: comprehensive conventional set
    // If a currency is missing a single widely-used glyph, we use a conventional prefix or abbreviation.
    // Fallback: code + " "
    // --------------------------
    const currencySymbols = {
        AED: "د.إ",
        AFN: "Af",
        ALL: "L",
        AMD: "֏",
        ANG: "ƒ",
        AOA: "Kz",
        ARS: "AR$",
        AUD: "A$",
        AWG: "ƒ",
        AZN: "₼",
        BAM: "KM",
        BBD: "Bds$",
        BDT: "৳",
        BGN: "лв",
        BHD: "د.ب",
        BIF: "FBu",
        BMD: "$",
        BND: "B$",
        BOB: "Bs.",
        BRL: "R$",
        BSD: "$",
        BTN: "Nu.",
        BWP: "P",
        BYN: "Br",
        BZD: "BZ$",
        CAD: "C$",
        CDF: "FC",
        CHF: "CHF",
        CLP: "CLP$",
        CNY: "¥",
        COP: "COL$",
        CRC: "₡",
        CUC: "CUC$",
        CUP: "CUP₱", // sometimes CUP uses $/₱ — fallback
        CVE: "Esc",
        CZK: "Kč",
        DJF: "Fdj",
        DKK: "kr",
        DOP: "RD$",
        DZD: "د.ج",
        EGP: "E£",
        ERN: "Nfk",
        ETB: "Br",
        EUR: "€",
        FJD: "FJ$",
        FKP: "£",
        FOK: "kr",
        GBP: "£",
        GEL: "₾",
        GGP: "£",
        GHS: "₵",
        GIP: "£",
        GMD: "D",
        GNF: "FG",
        GTQ: "Q",
        GYD: "GY$",
        HKD: "HK$",
        HNL: "L",
        HRK: "kn",
        HTG: "G",
        HUF: "Ft",
        IDR: "Rp",
        ILS: "₪",
        IMP: "£",
        INR: "₹",
        IQD: "ع.د",
        IRR: "﷼",
        ISK: "kr",
        JEP: "£",
        JMD: "J$",
        JOD: "د.ا",
        JPY: "¥",
        KES: "KSh",
        KGS: "лв",
        KHR: "៛",
        KID: "A$", // Kiribati uses AUD
        KMF: "CF",
        KRW: "₩",
        KWD: "د.ك",
        KYD: "KY$",
        KZT: "₸",
        LAK: "₭",
        LBP: "ل.ل",
        LKR: "Rs",
        LRD: "L$",
        LSL: "L",
        LYD: "ل.د",
        MAD: "د.م.",
        MDL: "L",
        MGA: "Ar",
        MKD: "ден",
        MMK: "Ks",
        MNT: "₮",
        MOP: "MOP$",
        MRU: "UM",
        MUR: "₨",
        MVR: "ރ.",
        MWK: "MK",
        MXN: "MX$",
        MYR: "RM",
        MZN: "MT",
        NAD: "N$",
        NGN: "₦",
        NIO: "C$",
        NOK: "kr",
        NPR: "₨",
        NZD: "NZ$",
        OMR: "ر.ع.",
        PAB: "B/.",
        PEN: "S/",
        PGK: "K",
        PHP: "₱",
        PKR: "₨",
        PLN: "zł",
        PYG: "₲",
        QAR: "﷼",
        RON: "lei",
        RSD: "дин",
        RUB: "₽",
        RWF: "FRw",
        SAR: "﷼",
        SBD: "SI$",
        SCR: "₨",
        SDP: "£",
        SDG: "SDG",
        SEK: "kr",
        SGD: "S$",
        SHP: "£",
        SLL: "Le",
        SOS: "S",
        SRD: "SRD$",
        SSP: "£",
        STN: "Db",
        SYP: "£",
        SZL: "E",
        THB: "฿",
        TJS: "SM",
        TMT: "T",
        TND: "د.ت",
        TOP: "T$",
        TRY: "₺",
        TTD: "TT$",
        TVD: "A$",
        TWD: "NT$",
        TZS: "TSh",
        UAH: "₴",
        UGX: "USh",
        USD: "$",
        UYU: "$U",
        UZS: "so'm",
        VES: "Bs.S",
        VND: "₫",
        VUV: "VT",
        WST: "WS$",
        XAF: "FCFA",
        XCD: "EC$",
        XDR: "SDR",
        XOF: "CFA",
        XPF: "CFP",
        YER: "﷼",
        ZAR: "R",
        ZMW: "ZK",
        ZWL: "ZWL$"
    };

    // expose symbols to the global scope so the UI can read them
    window.currencySymbols = currencySymbols;

    // --------------------------
    // Conversion & formatting helpers
    // --------------------------
    window.convertCurrency = function convertCurrency(amount, from = "USD", to = "USD") {
        const amt = amount instanceof Decimal ? amount : new Decimal(amount);
        const fromC = normalizeCode(from);
        const toC = normalizeCode(to);

        if (fromC === toC) return amt;

        const rateFrom = window.currencyRates[fromC] ?? null;
        const rateTo = window.currencyRates[toC] ?? null;

        const rFrom = rateFrom ? new Decimal(rateFrom) : dOne;
        const rTo = rateTo ? new Decimal(rateTo) : dOne;

        return amt.div(rFrom).mul(rTo);
    };

    window.formatCurrency = function formatCurrency(decimalIn, currency = (typeof options !== "undefined" && options.currency) ? options.currency : "USD", precision = 2, notation = (typeof options !== "undefined" && options.notation) ? options.notation : "Scientific") {
        const code = normalizeCode(currency);
        const amount = decimalIn instanceof Decimal ? decimalIn : new Decimal(decimalIn);

        // Old behavior: assume incoming decimalIn is USD amount; convert to target currency
        const converted = window.convertCurrency(amount, "USD", code);

        const symbol = currencySymbols[code] ?? (code + " ");

        try {
            return symbol + format(converted, precision, notation);
        } catch (e) {
            console.warn("format() failed in formatCurrency, falling back to toFixed:", e);
            return symbol + Number(converted).toFixed(precision);
        }
    };

    // --------------------------
    // INIT: load cached then refresh; expose manual refresh
    // --------------------------
    const cachedOnStart = loadCachedRates();
    if (cachedOnStart) {
        mergeRates(cachedOnStart);
        console.log("currency.js loaded cached FX rates at startup.");
    }

    // initial fetch and schedule
    refreshFX();
    setInterval(refreshFX, REFRESH_INTERVAL_MS);

    window._yemm_refreshFX = refreshFX;

    console.log("🌸 YooA: Currency system initialized — using jsDelivr free JSON. Cached fallback is enabled.");
})();
