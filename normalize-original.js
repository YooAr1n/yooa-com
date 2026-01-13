// Original normalize function for comparison
function normalize_original() {
  /*
  PSEUDOCODE:
  Whenever we are partially 0 (sign is 0 or mag and layer is 0), make it fully 0.
  Whenever we are at or hit layer 0, extract sign from negative mag.
  If layer === 0 and mag < FIRST_NEG_LAYER (1/9e15), shift to 'first negative layer' (add layer, log10 mag).
  While abs(mag) > EXP_LIMIT (9e15), layer += 1, mag = maglog10(mag).
  While abs(mag) < LAYER_DOWN (15.954) and layer > 0, layer -= 1, mag = pow(10, mag).
        When we're done, all of the following should be true OR one of the numbers is not IsFinite OR layer is not IsInteger (error state):
  Any 0 is totally zero (0, 0, 0) and any NaN is totally NaN (NaN, NaN, NaN).
  Anything layer 0 has mag 0 OR mag > 1/9e15 and < 9e15.
  Anything layer 1 or higher has abs(mag) >= 15.954 and < 9e15.
  Any positive infinity is (1, Infinity, Infinity) and any negative infinity is (-1, Infinity, Infinity).
  We will assume in calculations that all Decimals are either erroneous or satisfy these criteria. (Otherwise: Garbage in, garbage out.)
  */
  //Any 0 is totally 0
  if (this.sign === 0 || this.mag === 0 && this.layer === 0 || this.mag === Number.NEGATIVE_INFINITY && this.layer > 0 && Number.isFinite(this.layer)) {
    this.sign = 0;
    this.mag = 0;
    this.layer = 0;
    return this;
  }
  //extract sign from negative mag at layer 0
  if (this.layer === 0 && this.mag < 0) {
    this.mag = -this.mag;
    this.sign = -this.sign;
  }
  //Handle infinities
  if (this.mag === Number.POSITIVE_INFINITY || this.layer === Number.POSITIVE_INFINITY || this.mag === Number.NEGATIVE_INFINITY || this.layer === Number.NEGATIVE_INFINITY) {
    this.mag = Number.POSITIVE_INFINITY;
    this.layer = Number.POSITIVE_INFINITY;
    return this;
  }
  //Handle shifting from layer 0 to negative layers.
  if (this.layer === 0 && this.mag < FIRST_NEG_LAYER) {
    this.layer += 1;
    this.mag = Math.log10(this.mag);
    return this;
  }
  var absmag = Math.abs(this.mag);
  var signmag = Math.sign(this.mag);
  if (absmag >= EXP_LIMIT) {
    this.layer += 1;
    this.mag = signmag * Math.log10(absmag);
    return this;
  } else {
    while (absmag < LAYER_DOWN && this.layer > 0) {
      this.layer -= 1;
      if (this.layer === 0) {
        this.mag = Math.pow(10, this.mag);
      } else {
        this.mag = signmag * Math.pow(10, absmag);
        absmag = Math.abs(this.mag);
        signmag = Math.sign(this.mag);
      }
    }
    if (this.layer === 0) {
      if (this.mag < 0) {
        //extract sign from negative mag at layer 0
        this.mag = -this.mag;
        this.sign = -this.sign;
      } else if (this.mag === 0) {
        //excessive rounding can give us all zeroes
        this.sign = 0;
      }
    }
  }
  if (Number.isNaN(this.sign) || Number.isNaN(this.layer) || Number.isNaN(this.mag)) {
    this.sign = Number.NaN;
    this.layer = Number.NaN;
    this.mag = Number.NaN;
  }
  return this;
}