window.addCommas = function addCommas(s){
	if (s.length <= 3) return s
	let rem = s.length % 3
	if (rem == 0) rem = 3
	return s.slice(0, rem) + "," + addCommas(s.slice(rem))
}

window.exponentialFormat = function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	if (m.toStringWithDecimalPlaces(precision) == 10) {
		m = new Decimal(1)
		e = e.add(1)
	}
	let start = ""
	if (e.abs().lt(1e9)) {
		if (m.toStringWithDecimalPlaces(precision) == 10) {
			m = new Decimal(1)
			e = e.add(1)
		}
		start = m.toStringWithDecimalPlaces(precision)
	}
	
	let end = e.toStringWithDecimalPlaces(0)
	if (!end.includes("e")) end = addCommas(end.replace(/-/g, ''))
	if (e.lt(0)) end = "-" + end
	return start + "e" + end
}

window.commaFormat = function commaFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.001) return (0).toFixed(precision)
    let init = num.toStringWithDecimalPlaces(precision)
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    if (portions.length == 1) return portions[0]
    return portions[0] + "." + portions[1]
}

window.regularFormat = function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.0001) return (0).toFixed(precision)
    if (num.mag < 0.1 && precision !==0) precision = Math.max(precision, 4)
    return num.toStringWithDecimalPlaces(precision)
}

window.fixValue = function fixValue(x, y = 0) {
	return x || new Decimal(y)
}

window.sumValues = function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}

window.format = function format(decimal, precision = 2) {
    decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		return "NaN"
	}
	if (decimal.sign < 0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag<0) {
		if (decimal.layer > 3 || (decimal.mag < -1e10 && decimal.layer == 3)) return "1/" + format(decimal.recip(), precision)
		else exponentialFormat(decimal, precision)
	}
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.layer > 3 || (decimal.mag >= 1e10 && decimal.layer == 3)) {
		var slog = decimal.slog()
		if (slog.gte(1e9)) return "F" + formatWhole(slog.floor())
		if (slog.gte(100)) return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
		else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(4) + "F" + commaFormat(slog.floor(), 0)
	} else if (decimal.layer > 2 || (Math.abs(decimal.mag) > 100 && decimal.layer == 2)) {
		return "e" + format(decimal.log10(), precision)
	} else if (decimal.layer > 1 || (Math.abs(decimal.mag) >= 1e12 && decimal.layer == 1)) {
		return "e" + format(decimal.log10(), 4)
	} else if (decimal.layer > 0 || decimal.mag >= 1e9) {
		return exponentialFormat(decimal, precision)
	} else if (decimal.mag >= 1000) {
		return commaFormat(decimal, 0)
	} else if (decimal.mag>=0.001) {
		return regularFormat(decimal, precision)
	} else if (decimal.sign!=0) {
		return exponentialFormat(decimal, precision)
	} else return regularFormat(decimal, precision)
}

window.formatWhole = function formatWhole(decimal) {
    decimal = new Decimal(decimal)
    if (decimal.gte(1e9)) return format(decimal, 2)
    if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
    return format(decimal, 0)
}

window.formatTime = function formatTime(s) {
    if (s < 60) return format(s) + "s"
    else if (s < 3600) return formatWhole(Math.floor(s / 60)) + "m " + format(s % 60) + "s"
    else if (s < 86400) return formatWhole(Math.floor(s / 3600)) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else if (s < 31536000) return formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else return formatWhole(Math.floor(s / 31536000)) + "y " + formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
}

window.toPlaces = function toPlaces(x, precision, maxAccepted) {
    x = new Decimal(x)
    let result = x.toStringWithDecimalPlaces(precision)
    if (new Decimal(result).gte(maxAccepted)) {
        result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
    }
    return result
}

// Will also display very small numbers
window.formatSmall = function formatSmall(x, precision=2) { 
    return format(x, precision, true)    
}

window.invertOOM = function invertOOM(x){
    let e = x.log10().ceil()
    let m = x.div(Decimal.pow(10, e))
    e = e.neg()
    x = new Decimal(10).pow(e).times(m)

    return x
}

window.colorText = function colorText(elem, color, text) {
	return "<" + elem + " style='color:" + color + ";text-shadow:0px 0px 10px;'>" + text + "</" + elem + ">"
}

window.formatGain = function formatGain(a,e, FPS, percent, DT = Decimal.tetrate(10, 10)) {
	a = new Decimal(a)
	e = new Decimal(e)
    const g = Decimal.add(a,e.div(FPS))

    if (g.neq(a) || percent) {
        if (a.gte(DT)) {
            var oom = g.slog(10).sub(a.slog(10)).mul(FPS)
            if (oom.gte(1e-3)) return "(+" + format(oom) + " OoMs^^2/s)"
        }
		
        if (a.gte('ee100')) {
            var tower = Math.floor(a.slog(10).toNumber() - 1.3010299956639813);
    
            var oom = g.iteratedlog(10,tower).sub(a.iteratedlog(10,tower)).mul(FPS), rated = false;
    
            if (oom.gte(1)) rated = true
            else if (tower > 2) {
                tower--
                oom = g.iteratedlog(10,tower).sub(a.iteratedlog(10,tower)).mul(FPS)
                if (oom.gte(1)) rated = true
            }
    
            if (rated) return "(+" + format(oom) + " OoMs^"+tower+"/s)"
        }
    
        if (a.gte(1e100) || percent) {
            const oom = g.div(a).log10().mul(FPS)
            if (oom.gte(10)) return "(+" + format(oom) + " OoMs/s)"
			if (oom.gte(Math.log10(2)) || percent) return "(+" + format(oom.pow10().sub(1).mul(100)) + "%/s)"
        }
    }

    return "(" + (e.lt(0) ? "" : "+") + format(e) + "/s)"
}