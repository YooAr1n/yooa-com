// Constants
const dZero = new Decimal(0);
const dOne = new Decimal(1);

// uses Decimal, and works for ALL cost functions (cumulative or not), returns quantity and purchasePrice
// function works for ALL numbers, even SUPER BIG ones like > 1.8e308 or even HUGE NUMBERS like tetrational numbers
// Decimal - a number that can go > 1.8e308, and in break.eternity.js, is in the form sign, layer, mag
/* Variables:
money - Decimal - amount of money available to spend
costFunction - function - returns cost of purchase at given level
invCostFunction - function - returns amount of purchases affordable for given money 
cumulative - boolean - whether or not the cost function is cumulative
maxLevel - Decimal - maximum level of upgrade (null if no max)
firstCost - Decimal - cost of first purchase

Returns: { quantity: Decimal, purchasePrice: Decimal }
quantity - Decimal - number of purchases to make
purchasePrice - Decimal - total cost of purchases
*/

// Assumes a Decimal library like break.eternity.js is available globally
window.bulkBuyBinarySearch = function (money, { costFunction, invCostFunction = null, cumulative = true, maxLevel = null, firstCost = null }, owned) {

  // Normalize inputs
  money = money instanceof Decimal ? money : new Decimal(money || 0);
  owned = owned instanceof Decimal ? owned : (owned == null ? dZero : new Decimal(owned));
  firstCost = firstCost == null ? null : (firstCost instanceof Decimal ? firstCost : new Decimal(firstCost));

  // Resolve maxLevel if it's a function (meta.maxLvlFunc style) or a Decimal/null
  let maxLvl = null;
  try {
    if (typeof maxLevel === "function") maxLvl = maxLevel();
    else if (maxLevel != null) maxLvl = maxLevel;
  } catch (e) {
    // ignore - leave as null
  }
  if (maxLvl != null && !(maxLvl instanceof Decimal)) maxLvl = new Decimal(maxLvl);

  // Quick rejects
  if (money.lte(dZero)) return { quantity: dZero, purchasePrice: dZero };
  if (firstCost != null && money.lt(firstCost)) return { quantity: dZero, purchasePrice: dZero };

  const costAtOwned = costFunction(owned);

  // --------------------------------------------------
  // UNIFIED helper to perform your original log-slog 
  // binary-search expansion + bisection.
  // Used by both cumulative and non-cumulative branches.
  // --------------------------------------------------
  function findLogSlogLow(costFunction) {

    let low = dZero; // (in log(slog) scale)
    let high = dOne; // also in log(slog) scale
    const logSlogOwned = log_slogged(owned);
    const logSlogMax = maxLvl ? log_slogged(maxLvl) : null;

    // Respect max-level limit
    if (logSlogMax && high.add(logSlogOwned).gte(logSlogMax)) {
      high = logSlogMax.sub(logSlogOwned);
    }
    else {
      let unsloggedHigh = unlog_slogged(high.add(logSlogOwned));

      // EXPANSION LOOP - same logic as original:
      // while cost(unsloggedHigh) - cost(owned) <= money, double high
      while (costFunction(unsloggedHigh).sub(costAtOwned).lte(money)) {
        low = high;
        high = high.mul(2);

        // cap by max-level
        if (logSlogMax && high.add(logSlogOwned).gte(logSlogMax)) {
          high = logSlogMax.sub(logSlogOwned);
        }

        unsloggedHigh = unlog_slogged(high.add(logSlogOwned));
      }
    }

    // BINARY SEARCH (same as original)
    let iter = 0, MAX_ITER = 2000;
    while (high.neq_tolerance(low, 1e-10)) {
      if (++iter > MAX_ITER) { console.log(high); console.log(low); console.warn("expansion loop hit MAX_ITER"); break; }

      let mid = low.add(high).div(2);
      const unsloggedMid = unlog_slogged(mid.add(logSlogOwned));

      // same affordability check as original
      if (costFunction(unsloggedMid).sub(costAtOwned).lte(money)) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return { low, logSlogOwned };
  }


  // ================
  // NON-CUMULATIVE
  // ================
  if (!cumulative) {

    // Fast path: use inverse cost function if available
    if (invCostFunction) {

      // Use inverse cost function if available
      let affordable = invCostFunction(money).sub(owned).add(1).floor().max(dZero);
      if (maxLvl != null) {
        let maxAffordable = maxLvl.sub(owned).max(dZero);
        affordable = Decimal.min(affordable, maxAffordable);
      }

      const totalCost = costFunction(owned.add(affordable)).sub(costAtOwned);
      return { quantity: affordable, purchasePrice: totalCost };
    }

    // Otherwise, use shared log-slog binary search
    const { low, logSlogOwned } = findLogSlogLow(costFunction);

    let affordable = unlog_slogged(logSlogOwned.add(low))
      .sub(owned).add(1)
      .floor().max(dZero);

    const totalCost = costFunction(owned.add(affordable)).sub(costAtOwned);
    return { quantity: affordable, purchasePrice: totalCost };
  }



  // ================
  // CUMULATIVE
  // ================
  if (invCostFunction) {

    // Use inverse cost function if available
    let affordable = invCostFunction(money).sub(owned).add(1).floor().max(dZero);
    if (maxLvl != null) {
      let maxAffordable = maxLvl.sub(owned).max(dZero);
      affordable = Decimal.min(affordable, maxAffordable);
    }

    let totalCost = getTotalCost(costFunction, owned, affordable);

    // because it is cumulative, getTotalCost can be greater than money
    while (totalCost.gt(money) && affordable.gt(dZero)) {
      affordable = affordable.sub(1);
      totalCost = getTotalCost(costFunction, owned, affordable);
    }

    return { quantity: affordable, purchasePrice: totalCost };
  }


  // Otherwise, use unified log-slog binary search same as original cumulative branch
  const { low, logSlogOwned } = findLogSlogLow(costFunction);

  let affordable = unlog_slogged(logSlogOwned.add(low))
    .sub(owned).add(1)
    .floor().max(dZero);

  let totalCost = getTotalCost(costFunction, owned, affordable);

  // because it is cumulative, getTotalCost can be greater than money
  while (totalCost.gt(money) && affordable.gt(dZero)) {
    affordable = affordable.sub(1);
    totalCost = getTotalCost(costFunction, owned, affordable);
  }

  return { quantity: affordable, purchasePrice: totalCost };
};


// --------------------------------------------------
// ORIGINAL getTotalCost (unchanged)
// --------------------------------------------------
function getTotalCost(costFunction, owned, quantity) {
  owned = owned instanceof Decimal ? owned : new Decimal(owned);
  quantity = quantity instanceof Decimal ? quantity : new Decimal(quantity);

  if (quantity.eq(0)) return dZero;

  let i = owned.add(quantity).sub(1);
  let totalCost = costFunction(i), prevTotalCost = costFunction(owned);

  // start from most expensive purchase so we can break early if costs stop changing because of precision limits
  while (totalCost.neq(prevTotalCost) && i.gt(owned)) { 
    i = i.sub(1);
    prevTotalCost = totalCost;
    totalCost = costFunction(i).add(prevTotalCost);
  }

  return totalCost;
}


// --------------------------------------------------
// ORIGINAL helper functions (unchanged)
// --------------------------------------------------
function log_slogged(num) {
  num = new Decimal(num);
  return slog10(num.add(1)).add(1).log10()
}

function unlog_slogged(num) {
  num = new Decimal(num);
  return tet10(num.pow10().sub(1)).sub(1)
}
