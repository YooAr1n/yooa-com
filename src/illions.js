var answer

var t1illions = ["", "m", "b", "tr", "quadr", "quint", "sext", "sept", "oct", "non"]
var t1ones = ["", "un", "duo", "tre", "quattuor", "quin", "sex", "septen", "octo", "novem"]
var t1tens = ["", "dec", "vigint", "trigint", "quadragint", "quinquagint", "sexagint", "septuagint", "octogint", "nonagint"]
var t1hundreds = ["", "cent", "ducent", "tricent", "quadringent", "quingent", "sescent", "septingent", "octingent", "nongent"]

var t2illions = ["", "mill", "micr", "nan", "pic", "femt", "att", "zept", "yoct", "ront", "quect"]
var t2ones = ["", "me", "due", "trio", "tetre", "pente", "hexe", "hepte", "octe", "enne"]
var t2tens = ["", "c", "icos", "triacont", "tetracont", "pentacont", "hexacont", "heptacont", "octacont", "ennacont"]
var t2hundreds = ["", "hect", "dohect", "triahect", "tetrahect", "pentahect", "hexahect", "heptahect", "octahect", "ennahect"]

var t3illions = ["", "kill", "meg", "gig", "ter", "pet", "ex", "zett", "yott", "ronn", "quett",
    "hend", "dok", "tradak", "tedak", "pedak", "exdak", "zedak", "yodak", "nedak"
]
var t3ones = ["", "en", "od", "tr", "ter", "pet", "ect", "zet", "yot", "ron"]
var t3mults = ["", "", "d", "tr", "t", "p", "ex", "z", "y", "n", "quett"]
var t3os = ["k", "k", "c", "c", "c", "c", "k", "c", "k", "c"]
var t3tens = ["", "", "i", "tra", "te", "pe", "exa", "za", "yo", "ne"]
var t3hundreds = ["", "ho", "bo", "tro", "to", "po", "exo", "zo", "yoo", "no"]

var t4illions = ["", "al", "ej", "ij", "ast", "un", "erm", "ov", "ol", "et",
  "oc", "ax", "up", "ers", "ult", "et", "ev", "yp", "omn", "ut"
]
var t4ons = ["", "k", "m", "g", "", "l", "f", "j", "s", "b",
  "gl", "g", "s", "v", "m", "m", "x", "h", "", "o"
]
var t4ones = ["", "en", "od", "tr", "ter", "pet", "ect", "zet", "yot", "ron"]
var t4tens = ["", "", "i", "tra", "te", "pe", "exa", "za", "yo", "ne"]
var t4os = ["k", "k", "c", "c", "c", "c", "k", "c", "k", "c"]
var t4hundreds = ["", "ho", "bo", "tro", "to", "po", "exo", "zo", "yoo", "no"]

var num_illion
var illions
var tN_illions = [0, 0, 0, 0]
var t2_1 = ""
var t3_1 = ""
var t4_1 = ""

var EXP_LIMIT = 9e15; //If we're ABOVE this value, increase a layer. (9e15 is close to the largest integer that can fit in a Number.)
  
var LAYER_DOWN = Math.log10(9e15); //If we're BELOW this value, drop down a layer. About 15.954.
  
var FIRST_NEG_LAYER = 1/9e15; //At layer 0, smaller non-zero numbers than this become layer 1 numbers with negative mag. After that the pattern continues as normal.

var NUMBER_EXP_MAX = 308; //The largest exponent that can appear in a Number, though not all mantissas are valid here.

var NUMBER_EXP_MIN = -324; //The smallest exponent that can appear in a Number, though not all mantissas are valid here.
  
var MAX_ES_IN_A_ROW = 5; //For default toString behaviour, when to swap from eee... to (e^n) syntax.

function Decimal(value) {
      
    this.sign = Number.NaN;
    this.layer = Number.NaN;
    this.mag = Number.NaN;

    if (value instanceof Decimal) {
      this.fromDecimal(value);
    } else if (typeof value === "number") {
      this.fromNumber(value);
    } else if (typeof value === "string") {
      this.fromString(value);
    } else {
      this.sign = 0;
      this.layer = 0;
      this.mag = 0;
    }
}

var D = function D(value) {
    return Decimal.fromValue_noAlloc(value);
};

var FC = function FC(sign, layer, mag) {
    return Decimal.fromComponents(sign, layer, mag);
};

var FC_NN = function FC_NN(sign, layer, mag) {
    return Decimal.fromComponents_noNormalize(sign, layer, mag);
};

  Decimal.fromValue_noAlloc = function (value) {
    return value instanceof Decimal ? value : new Decimal(value);
  };

  Decimal.prototype.fromComponents = function (sign, layer, mag) {
    this.sign = sign;
    this.layer = layer;
    this.mag = mag;

    this.normalize();
    return this;
  };

  Decimal.prototype.fromComponents_noNormalize = function (sign, layer, mag) {
    this.sign = sign;
    this.layer = layer;
    this.mag = mag;
    return this;
  };

  Decimal.fromComponents = function (sign, layer, mag) {
    return new Decimal().fromComponents(sign, layer, mag);
  };

  Decimal.fromComponents_noNormalize = function (sign, layer, mag) {
    return new Decimal().fromComponents_noNormalize(sign, layer, mag);
  };

  Decimal.mul = function (value, other) {
    return D(value).mul(other);
  };

  Decimal.prototype.mul = function (value) {
    var decimal = D(value);
    
    //inf/nan check
    if (!Number.isFinite(this.layer)) { return this; }
    if (!Number.isFinite(decimal.layer)) { return decimal; }
    
    //Special case - if one of the numbers is 0, return 0.
    if (this.sign === 0 || decimal.sign === 0) { return FC_NN(0, 0, 0); }
    
    //Special case - Multiplying a number by its own reciprocal yields +/- 1, no matter how large.
    if (this.layer === decimal.layer && this.mag === -decimal.mag) { return FC_NN(this.sign*decimal.sign, 0, 1); }
          
    var a;
    var b;
    
    //Which number is bigger in terms of its multiplicative distance from 1?
    if ((this.layer > decimal.layer) || (this.layer == decimal.layer && Math.abs(this.mag) > Math.abs(decimal.mag)))
    {
      a = this;
      b = decimal;
    }
    else
    {
      a = decimal;
      b = this;
    }
    
    if (a.layer === 0 && b.layer === 0) { return D(a.sign*b.sign*a.mag*b.mag); }
    
    //Special case: If one of the numbers is layer 3 or higher or one of the numbers is 2+ layers bigger than the other, just take the bigger number.
    if (a.layer >= 3 || (a.layer - b.layer >= 2)) { return FC(a.sign*b.sign, a.layer, a.mag); }

    if (a.layer === 1 && b.layer === 0)
    { 
      return FC(a.sign*b.sign, 1, a.mag+Math.log10(b.mag));
    }
    
    if (a.layer === 1 && b.layer === 1)
    {
      return FC(a.sign*b.sign, 1, a.mag+b.mag);
    }
    
    if (a.layer === 2 && b.layer === 1)
    {
      var newmag = FC(Math.sign(a.mag), a.layer-1, Math.abs(a.mag)).add(FC(Math.sign(b.mag), b.layer-1, Math.abs(b.mag)));
      return FC(a.sign*b.sign, newmag.layer+1, newmag.sign*newmag.mag);
    }
    
    if (a.layer === 2 && b.layer === 2)
    {
      var newmag = FC(Math.sign(a.mag), a.layer-1, Math.abs(a.mag)).add(FC(Math.sign(b.mag), b.layer-1, Math.abs(b.mag)));
      return FC(a.sign*b.sign, newmag.layer+1, newmag.sign*newmag.mag);
    }
    
    throw Error("Bad arguments to mul: " + this + ", " + value);
  };

Decimal.prototype.normalize = function () {
    /*
    PSEUDOCODE:
    Whenever we are partially 0 (sign is 0 or mag and layer is 0), make it fully 0.
    Whenever we are at or hit layer 0, extract sign from negative mag.
    If layer === 0 and mag < FIRST_NEG_LAYER (1/9e15), shift to 'first negative layer' (add layer, log10 mag).
    While abs(mag) > EXP_LIMIT (9e15), layer += 1, mag = maglog10(mag).
    While abs(mag) < LAYER_DOWN (15.954) and layer > 0, layer -= 1, mag = pow(10, mag).
    
    When we're done, all of the following should be true OR one of the numbers is not IsFinite OR layer is not IsInteger (error state):
    Any 0 is totally zero (0, 0, 0).
    Anything layer 0 has mag 0 OR mag > 1/9e15 and < 9e15.
    Anything layer 1 or higher has abs(mag) >= 15.954 and < 9e15.
    We will assume in calculations that all Decimals are either erroneous or satisfy these criteria. (Otherwise: Garbage in, garbage out.)
    */
    if (this.sign === 0 || (this.mag === 0 && this.layer === 0))
    {
      this.sign = 0;
      this.mag = 0;
      this.layer = 0;
      return this;
    }
    
    if (this.layer === 0 && this.mag < 0)
    {
      //extract sign from negative mag at layer 0
      this.mag = -this.mag;
      this.sign = -this.sign;
    }
    
    //Handle shifting from layer 0 to negative layers.
    if (this.layer === 0 && this.mag < FIRST_NEG_LAYER)
    {
      this.layer += 1;
      this.mag = Math.log10(this.mag);
      return this;
    }
    
    var absmag = Math.abs(this.mag);
    var signmag = Math.sign(this.mag);
    
    if (absmag >= EXP_LIMIT)
    {
      this.layer += 1;
      this.mag = signmag*Math.log10(absmag);
      return this;
    }
    else
    {
      while (absmag < LAYER_DOWN && this.layer > 0)
      {
        this.layer -= 1;
        if (this.layer === 0)
        {
          this.mag = Math.pow(10, this.mag);
        }
        else
        {
          this.mag = signmag*Math.pow(10, absmag);
          absmag = Math.abs(this.mag);
          signmag = Math.sign(this.mag);
        }
      }
      if (this.layer === 0)
      {
        if (this.mag < 0)
        {
          //extract sign from negative mag at layer 0
          this.mag = -this.mag;
          this.sign = -this.sign;
        }
        else if (this.mag === 0)
        {
          //excessive rounding can give us all zeroes
          this.sign = 0;
        }
      }
    }

    return this;
};

var IGNORE_COMMAS = true;
    var COMMAS_ARE_DECIMAL_POINTS = false;
    
    Decimal.prototype.fromString = function (value) {
      if (IGNORE_COMMAS) { value = value.replace(",", ""); }
      else if (COMMAS_ARE_DECIMAL_POINTS) { value = value.replace(",", "."); }
    
      //Handle x^^^y format.
      var pentationparts = value.split("^^^");
      if (pentationparts.length === 2)
      {
        var base = parseFloat(pentationparts[0]);
        var height = parseFloat(pentationparts[1]);
        var payload = 1;
        var heightparts = pentationparts[1].split(";");
        if (heightparts.length === 2)
        {
          var payload = parseFloat(heightparts[1]);
          if (!isFinite(payload)) { payload = 1; }
        }
        if (isFinite(base) && isFinite(height))
        {
          var result = Decimal.pentate(base, height, payload);
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
      }
    
      //Handle x^^y format.
      var tetrationparts = value.split("^^");
      if (tetrationparts.length === 2)
      {
        var base = parseFloat(tetrationparts[0]);
        var height = parseFloat(tetrationparts[1]);
        var heightparts = tetrationparts[1].split(";");
        if (heightparts.length === 2)
        {
          var payload = parseFloat(heightparts[1]);
          if (!isFinite(payload)) { payload = 1; }
        }
        if (isFinite(base) && isFinite(height))
        {
          var result = Decimal.tetrate(base, height, payload);
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
      }
      
      //Handle x^y format.
      var powparts = value.split("^");
      if (powparts.length === 2)
      {
        var base = parseFloat(powparts[0]);
        var exponent = parseFloat(powparts[1]);
        if (isFinite(base) && isFinite(exponent))
        {
          var result = Decimal.pow(base, exponent);
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
      }
      
      //Handle various cases involving it being a Big Number.
      value = value.trim().toLowerCase();
      
      //handle X PT Y format.
      var ptparts = value.split("pt");
      if (ptparts.length === 2)
      {
        base = 10;
        height = parseFloat(ptparts[0]);
        ptparts[1] = ptparts[1].replace("(", "");
        ptparts[1] = ptparts[1].replace(")", "");
        var payload = parseFloat(ptparts[1]);
        if (!isFinite(payload)) { payload = 1; }
        if (isFinite(base) && isFinite(height))
        {
          var result = Decimal.tetrate(base, height, payload);
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
      }
      
      //handle XpY format (it's the same thing just with p).
      var ptparts = value.split("p");
      if (ptparts.length === 2)
      {
        base = 10;
        height = parseFloat(ptparts[0]);
        ptparts[1] = ptparts[1].replace("(", "");
        ptparts[1] = ptparts[1].replace(")", "");
        var payload = parseFloat(ptparts[1]);
        if (!isFinite(payload)) { payload = 1; }
        if (isFinite(base) && isFinite(height))
        {
          var result = Decimal.tetrate(base, height, payload);
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
      }

      var parts = value.split("e");
      var ecount = parts.length-1;
    
      //Handle numbers that are exactly floats (0 or 1 es).
      if (ecount === 0)
      {
        var numberAttempt = parseFloat(value);
        if (isFinite(numberAttempt))
        {
          return this.fromNumber(numberAttempt);
        }
      }
      else if (ecount === 1)
      {
        //Very small numbers ("2e-3000" and so on) may look like valid floats but round to 0.
        var numberAttempt = parseFloat(value);
        if (isFinite(numberAttempt) && numberAttempt !== 0)
        {
          return this.fromNumber(numberAttempt);
        }
      }
      
      //Handle new (e^N)X format.
      var newparts = value.split("e^");
      if (newparts.length === 2)
      {
        this.sign = 1;
        if (newparts[0].charAt(0) == "-")
        {
          this.sign = -1;
        }
        var layerstring = "";
        for (var i = 0; i < newparts[1].length; ++i)
        {
          var chrcode = newparts[1].charCodeAt(i);
          if ((chrcode >= 43 && chrcode <= 57) || chrcode === 101) //is "0" to "9" or "+" or "-" or "." or "e" (or "," or "/")
          {
            layerstring += newparts[1].charAt(i);
          }
          else //we found the end of the layer count
          {
            this.layer = parseFloat(layerstring);
            this.mag = parseFloat(newparts[1].substr(i+1));
            this.normalize();
            return this;
          }
        }
      }
      
      if (ecount < 1) { this.sign = 0; this.layer = 0; this.mag = 0; return this; }
      var mantissa = parseFloat(parts[0]);
      if (mantissa === 0) { this.sign = 0; this.layer = 0; this.mag = 0; return this; }
      var exponent = parseFloat(parts[parts.length-1]);
      //handle numbers like AeBeC and AeeeeBeC
      if (ecount >= 2)
      {
        var me = parseFloat(parts[parts.length-2]);
        if (isFinite(me))
        {
          exponent *= Math.sign(me);
          exponent += f_maglog10(me);
        }
      }
      
      //Handle numbers written like eee... (N es) X
      if (!isFinite(mantissa))
      {
        this.sign = (parts[0] === "-") ? -1 : 1;
        this.layer = ecount;
        this.mag = exponent;
      }
      //Handle numbers written like XeY
      else if (ecount === 1)
      {
        this.sign = Math.sign(mantissa);
        this.layer = 1;
        //Example: 2e10 is equal to 10^log10(2e10) which is equal to 10^(10+log10(2))
        this.mag = exponent + Math.log10(Math.abs(mantissa));
      }
      //Handle numbers written like Xeee... (N es) Y
      else
      {
        this.sign = Math.sign(mantissa);
        this.layer = ecount;
        if (ecount === 2)
        {
          var result = Decimal.mul(FC(1, 2, exponent), D(mantissa));
          this.sign = result.sign;
          this.layer = result.layer;
          this.mag = result.mag;
          return this;
        }
        else
        {
          //at eee and above, mantissa is too small to be recognizable!
          this.mag = exponent;
        }
      }
      
      this.normalize();
      return this;
    };

    Decimal.prototype.fromValue = function (value) {
      if (value instanceof Decimal) {
        return this.fromDecimal(value);
      }

      if (typeof value === "number") {
        return this.fromNumber(value);
      }

      if (typeof value === "string") {
        return this.fromString(value);
      }

      this.sign = 0;
      this.layer = 0;
      this.mag = 0;
      return this;
    };

    Decimal.prototype.toNumber = function () {
      if (!Number.isFinite(this.layer)) { return Number.NaN; }
      if (this.layer === 0)
      {
        return this.sign*this.mag;
      }
      else if (this.layer === 1)
      {
        return this.sign*Math.pow(10, this.mag);
      }
      else //overflow for any normalized Decimal
      {
        return this.mag > 0 ? (this.sign > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY) : 0;
      }
    };

Decimal.prototype.fromNumber = function (value) {
    this.mag = Math.abs(value);
    this.sign = Math.sign(value);
    this.layer = 0;
    this.normalize();
    return this;
  }

var f_maglog10 = function(n) {
    return Math.sign(n)*Math.log10(Math.abs(n));
  }

function t1format(ill) {
    let t1
    let illion = ill % 1000
    let hund = Math.floor(illion / 10) % 10 != 0 && Math.floor(illion / 100) % 10 != 0 ? "i" : ""
    if (illion == -1) t1 = ""
    else if (ill == 0) {
        t1 = "thousand"
    }
    else if (illion < 10) {
        t1 = t1illions[illion] + "illion"
    }
    else t1 = t1ones[illion % 10] + t1tens[Math.floor(illion / 10) % 10] + (hund) + t1hundreds[Math.floor(illion / 100) % 10] + "illion"
    return t1
}

function t1mult(ill) {
    let t1
    let illion = ill % 1000
    let hund = Math.floor(illion / 10) % 10 != 0 && Math.floor(illion / 100) % 10 != 0 ? "i" : ""
    if (illion < 2) t1 = ""
    else if (illion < 10) {
        t1 = t1ones[illion]
    }
    else t1 = t1ones[illion % 10] + t1tens[Math.floor(illion / 10) % 10] + (hund) + t1hundreds[Math.floor(illion / 100) % 10] + (illion < 10 ? "" : "i")
    return t1
}

function t2format(t1, ill, i, i2 = 0) {
    if (ill < 1) return t1format(t1)
    let t2
    let illion = ill % 1000
    let hund = Math.floor(illion / 10) % 10 != 0 && Math.floor(illion / 100) % 10 != 0 ? "e" : ""
    let mult = Math.floor(t1 / 1000 ** ill) % 1000
    if (ill >= 100) mult = Math.floor(10 ** (t1 - 3 * ill)) % 1000

    let t2ill
    if (illion < 11) {
        t2ill = t2illions[illion]
    }
    else if (illion % 100 == 10) t2ill = "quect" + (hund) + t2hundreds[Math.floor(illion / 100) % 10]
    else if (illion % 100 == 13) t2ill = "trec" + (hund) + t2hundreds[Math.floor(illion / 100) % 10]
    else t2ill = t2ones[illion % 10] + t2tens[Math.floor(illion / 10) % 10] + (hund) + t2hundreds[Math.floor(illion / 100) % 10]

    let t21 = ""
    if (i < 3) {
      if (ill - 1 < 100 && ill >= 100) t21 = t2format(10 ** t1, ill - 1, i + 1, i2)
      else t21 = t2format(t1, ill - 1, i + 1, i2)
    }
    if (t21 == "thousand" || t21 == "illion") t21 = ""
    t2_1 += t21
    if (t2_1 == "thousand" || t2_1 == "illion") t2_1 = ""

    let span1 = "<span style = 'color:#7700dd'>"
    let span2 = "</span>"
    let spant2 = span1 + span2
    let spant3 = "<span style = 'color:#dd00dd'>" + span2

    let not2 = t2_1 == "" || (t2_1.includes(spant2) && t2_1.length % spant2.length == 0)
    let no_illion = ill < 1 || mult < 1

    let t3 = ""
    if (i2 == 0 && !no_illion) {
        for (let j = 0; j < 4; j++) {
            if (tN_illions[2] - j > 0) {
                if (tN_illions[2] - j < 100 && tN_illions[2] >= 100) t3 += t3format(10 ** tN_illions[1] - i, tN_illions[2] - j, j)
                else t3 += t3format(tN_illions[1] - i, tN_illions[2] - j, j)
                t3_1 = ""
            }
        }
    }

    t2 = t1mult(mult) + t3 + (no_illion ? "" : span1 + t2ill) + (not2 || no_illion ? "" : illion == 1 ? "i-" : "o-") + (no_illion ? "" : span2)
    t2 = t2.replaceAll(spant2, "")
    t2 = t2.replaceAll(spant3, "")
    return t2
}

function t2mult(ill) {
  let t2
  let illion = ill % 1000
  let hund = Math.floor(illion / 10) % 10 != 0 && Math.floor(illion / 100) % 10 != 0 ? "e" : ""
  if (illion < 2) t2 = ""
  else if (illion < 11) {
      t2 = t2illions[illion] + "e"
  }
  else if (illion % 100 == 10) t2 = "quect" + (hund) + t2hundreds[Math.floor(illion / 100) % 10] + "e"
  else if (illion % 100 == 13) t2 = "trec" + (hund) + t2hundreds[Math.floor(illion / 100) % 10] + "e"
  else t2 = t2ones[illion % 10] + t2tens[Math.floor(illion / 10) % 10] + (hund) + t2hundreds[Math.floor(illion / 100) % 10] + "e"
  return "<span style = 'color:#7700dd'>" + t2 + "</span>"
}

function t3format(t2, ill, i, i2 = 0) {
  if (ill < 1) {
    if (t2 < 100) return t2format(1000 ** t2, t2, i, 1)
    return t2format(3 * t2, t2, i, 1)
  }
  let t3
  let illion = ill % 1000
  let mult = Math.floor(t2 / 1000 ** ill) % 1000
  if (ill >= 100) mult = Math.floor(10 ** (t2 - 3 * ill)) % 1000

  let v = ["a", "e", "i", "o", "u"]
  let t3ill
  let t3ot = t3tens[Math.floor(illion / 10) % 10] + t3ones[illion % 10]
  if (illion % 100 >= 20) t3ot = t3tens[Math.floor(illion / 10) % 10] + t3os[illion % 10] + t3ones[illion % 10]
  else if (illion % 100 >= 10) {
    if (illion % 100 == 11 && illion >= 100) t3ot = "tend"
    else t3ot = t3illions[illion % 100]
  }
  let hund = (v.includes(t3ot[0]) || illion % 100 == 0) && illion >= 100 ? "t" : ""
  if (illion < 20) {
      t3ill = ill < 1000 ? t3illions[illion] : illion == 11 ? "tend" : t3ot
  }
  else t3ill = t3hundreds[Math.floor(illion / 100) % 10] + hund + t3ot

  let span1 = "<span style = 'color:#dd00dd'>"
  let span2 = "</span>"
  let spant2 = "<span style = 'color:#7700dd'>" + span2
  let spant3 = span1 + span2
  
  let t31 = ""
  if (i < 3) {
    if (ill - 1 < 100 && ill >= 100) t31 = t3format(10 ** t2, ill - 1, i + 1)
    else t31 = t3format(t2, ill - 1, i + 1)
  }
  if (t31 == "<span style = 'color:#7700dd'>o-" + span2) t31 = ""
  t3_1 += t31

  let not3 = t3_1 == "" || (t3_1.includes(spant3) && t3_1.length % spant3.length == 0)
  let no_illion = ill < 1 || mult < 1

  let t4 = ""
  if (i2 == 0 && !no_illion) {
      for (let j = 0; j < 4; j++) {
          if (tN_illions[3] - j > 0) {
              if (tN_illions[3] - j < 100 && tN_illions[3] >= 100) t4 += t4format(10 ** tN_illions[2] - i, tN_illions[3] - j, j)
              else t4 += t4format(tN_illions[2] - i, tN_illions[3] - j, j)
              t4_1 = ""
          }
      }
  }

  t3 = t2mult(mult) + t4 + span1 + (mult >= 1 ? t3ill : "") + (not3 || no_illion ? "" : "a") + span2
  t3 = t3.replaceAll(spant2, "")
  return t3
}

function t3mult(ill) {
  let t3
  let illion = ill % 1000

  let v = ["a", "e", "i", "o", "u"]
  let t3ot = t3tens[Math.floor(illion / 10) % 10] + t3ones[illion % 10]
  if (illion % 100 >= 20) t3ot = t3tens[Math.floor(illion / 10) % 10] + t3os[illion % 10] + t3ones[illion % 10]
  else if (illion % 100 >= 10) {
    if (illion % 100 == 11 && illion >= 100) t3ot = "tend"
    else t3ot = t3illions[illion % 100]
  }
  let hund = (v.includes(t3ot[0]) || illion % 100 == 0) && illion >= 100 ? "t" : ""
  if (illion < 2) t3 = ""
  else if (illion < 10) {
    t3 = t3mults[illion]
  }
  else if (illion < 20) {
    t3 = t3illions[illion]
  }
  else t3 = t3hundreds[Math.floor(illion / 100) % 10] + hund + t3ot
  return "<span style = 'color:#dd00dd'>" + t3 + "</span>"
}

function t4format(t3, ill, i) {
  if (ill < 1) {
    if (t3 < 100) return t3format(1000 ** t3, t3, i, 1)
    return t3format(3 * t3, t3, i, 1)
  }
  let t4
  let illion = ill % 1000
  let mult = Math.floor(t3 / 1000 ** ill) % 1000
  if (ill >= 100) mult = Math.floor(10 ** (t3 - 3 * ill)) % 1000

  let v = ["a", "e", "i", "o", "u"]
  let t4ill
  let t4ot = t4tens[Math.floor(illion / 10) % 10] + t4ones[illion % 10]
  if (illion % 100 >= 20) t4ot = t4tens[Math.floor(illion / 10) % 10] + t4os[illion % 10] + t4ones[illion % 10]
  else if (illion % 100 >= 10) {
    if (illion % 100 == 11 && illion >= 100) t4ot = "tend"
    else t4ot = t4illions[illion % 100]
  }
  let hund = (v.includes(t4ot[0]) || illion % 100 == 0) && illion >= 100 ? "t" : ""
  if (illion < 20) {
      t4ill = t4illions[illion]
  }
  else t4ill = t4hundreds[Math.floor(illion / 100) % 10] + hund + t4ot
  if (mult < 2) t4ill = t4ons[illion] + t4ill

  let span1 = "<span style = 'color:#dd0077'>"
  let span2 = "</span>"
  let spant2 = "<span style = 'color:#7700dd'>" + span2
  let spant3 = "<span style = 'color:#dd00dd'>" + span2
  let spant4 = span1 + span2
  
  let t41 = ""
  if (i < 3) {
    if (ill - 1 < 100 && ill >= 100) t41 = t4format(10 ** t3, ill - 1, i + 1)
    else t41 = t4format(t3, ill - 1, i + 1)
  }
  if (t41 == "<span style = 'color:#dd00dd'>a" + span2) t41 = ""
  t4_1 += t41


  t4 = t3mult(mult) + span1 + (mult >= 1 ? t4ill : "") + span2
  t4 = t4.replaceAll(spant2, "")
  t4 = t4.replaceAll(spant3, "")
  t4 = t4.replaceAll(span1 + "et", span1 + (illion == 9 ? "eet" : mult == 7 ? "eett" : "ett"))
  return t4
}

let submit = () => {
    answer = document.getElementById("num").value
    let num = new Decimal(answer)
    let t1illion = -1
    let t2illion = 0
    let t3illion = 0
    let t4illion = 0
    let mag = 1
    if (num.layer == 4) {
      if (num.mag >= 300 + Math.log10(3)) {
        t2illion = num.mag - Math.log10(3)
        t3illion = Math.max(Math.floor(t2illion / 3), 0)
        t4illion = Math.max(Math.floor(Math.log10(t3illion) / 3), 0)
      }
      else {
        t3illion = Math.max(10 ** (num.mag - Math.log10(3)), 0)
        t4illion = Math.max(Math.floor(Math.log10(t3illion) / 3), 0)
      }
  }
    if (num.layer == 3) {
        if (num.mag >= 300 + Math.log10(3)) {
          t2illion = num.mag - Math.log10(3)
          t3illion = Math.max(Math.floor(t2illion / 3), 0)
          t4illion = Math.max(Math.floor(Math.log10(t3illion) / 3), 0)
        }
        else {
          t2illion = Math.max(10 ** (num.mag - Math.log10(3)), 0)
          t3illion = Math.max(Math.floor(Math.log10(t2illion) / 3), 0)
        }
    }
    if (num.layer == 2) {
        if (num.mag >= 300 + Math.log10(3)) {
          t1illion = num.mag - Math.log10(3)
          t2illion = Math.max(Math.floor(t1illion / 3), 0)
          t3illion = Math.max(Math.floor(Math.log10(t2illion) / 3), 0)
        }
        else {
          t1illion = Math.max(10 ** (num.mag - Math.log10(3)), 0) - 1
          t2illion = Math.max(Math.floor(Math.log10(t1illion) / 3), 0)
        }
    }
    else if (num.layer == 1) {
        t1illion = Math.max(Math.floor(num.mag / 3), 0) - 1
        t2illion = Math.max(Math.floor(Math.log10(t1illion) / 3), 0)
        mag = 10 ** (num.mag % 3)
    }
    else if (num.layer == 0) {
        t1illion = Math.max(Math.floor(Math.log10(num.mag) / 3), 0) - 1
        mag = 10 ** (Math.log10(num.mag) % 3)
    }
    tN_illions = [t1illion, t2illion, t3illion, t4illion]
    /*for (let i = 0; i < tN_illions.length; i++) {
        if (tN_illions[i] > 0) tN_illions[i] = Math.round(tN_illions[i] / 10 ** Math.floor(Math.log10(tN_illions[i]) - 14)) * 10 ** Math.floor(Math.log10(tN_illions[i]) - 14)
    }*/
    
    let slogmag = 0
    if (num.mag < 10) slogmag = Math.log10(num.mag)
    else if (num.mag < 1e10) slogmag = 1 + Math.log10(Math.log10(num.mag))
    else slogmag = 2 + Math.log10(Math.log10(Math.log10(num.mag)))
    let slognum = num.layer + slogmag

    let t1 = tN_illions[1] < 4 ? t1format(tN_illions[0]) : ""
    let t2 = ""
    let t3 = ""
    let t4 = ""
    if (tN_illions[2] < 4) {
        for (let i = 0; i < 4; i++) {
            if (tN_illions[1] - i > 0) {
                if (tN_illions[1] - i < 100 && tN_illions[1] >= 100) t2 += t2format(10 ** tN_illions[0], tN_illions[1] - i, i)
                else t2 += t2format(tN_illions[0], tN_illions[1] - i, i)
                t2_1 = ""
                if (i == 3) t2 += "illion"
            }
        }
    }
    else if (tN_illions[3] < 4) {
      for (let i = 0; i < 4; i++) {
          if (tN_illions[2] - i > 0) {
              if (tN_illions[2] - i < 100 && tN_illions[2] >= 100) t3 += t3format(10 ** tN_illions[1], tN_illions[2] - i, i)
              else t3 += t3format(tN_illions[1], tN_illions[2] - i, i)
              t3_1 = ""
              if (i == 3) t3 += "illion"
          }
      }
    }
    else {
      for (let i = 0; i < 4; i++) {
          if (tN_illions[3] - i > 0) {
              if (tN_illions[3] - i < 100 && tN_illions[3] >= 100) t4 += t4format(10 ** tN_illions[2], tN_illions[3] - i, i)
              else t4 += t4format(tN_illions[2], tN_illions[3] - i, i)
              t4_1 = ""
              if (i == 3) t4 += "illion"
          }
      }
    }
    illions = t4 + t3 + t2 + t1

    num_illion = mag.toFixed(3) + " " + illions
    num_illion += " - YooA<br>slog: " + slognum.toFixed(3)
    document.getElementById("illions").innerHTML = "-illions: " + num_illion 
}

var exports = {
    submit
}

export default exports