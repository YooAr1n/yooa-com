window.bulkBuyBinarySearch = function bulkBuyBinarySearch(money, costInfo, alreadyBought) {
  const { costFunction, invCostFunction } = costInfo;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative !== undefined ? costInfo.cumulative : true;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel;

  // Early exit if not enough money for even the first upgrade
  if (money.lt(firstCost)) return null;

  let low, high;
  if (invCostFunction) {
    // Use the inverse cost function when available
    low = invCostFunction(money).floor().add(1).sub(alreadyBought);
  } else {
    // Exponentially double 'high' until the cost exceeds available money
    high = Decimal.dOne;
    let nextCost, maxReached = false;
    do {
      high = high.mul(2);
      nextCost = costFunction(Decimal.add(alreadyBought, high).sub(1));
      if (maxLevel && Decimal.add(alreadyBought, high).gte(maxLevel) && money.gte(nextCost)) {
        maxReached = true;
      }
    } while (money.gte(nextCost) && !maxReached);

    // If only one upgrade is affordable, return that result
    if (high.eq(2)) {
      return { quantity: Decimal.dOne, purchasePrice: firstCost };
    }

    // Set initial binary search bounds
    low = high.div(2);
    if (high.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

    // Binary search: narrow the bounds until the difference is 1
    while (high.sub(low).gt(1)) {
      const mid = Decimal.floor(low.add(high).div(2));
      const costAtMid = costFunction(Decimal.add(alreadyBought, mid).sub(1));
      if (money.gte(costAtMid)) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // Enforce max level cap if specified
  if (maxLevel) {
    low = Decimal.min(maxLevel.sub(alreadyBought), low);
  }
  const baseCost = costFunction(Decimal.add(alreadyBought, low.sub(1)));
  if (!isCumulative) {
    return { quantity: low, purchasePrice: Decimal.min(baseCost, money) };
  }

  // Compute cumulative cost by summing incremental costs from (quantity - 1) down to 1
  let cumulativeSum = Decimal.dZero, prevSum = Decimal.dZero;
  for (let i = low.sub(1); i.gt(0); i = i.sub(1)) {
    const cost_i = costFunction(Decimal.add(alreadyBought, i).sub(1));
    const newSum = cumulativeSum.add(cost_i);
    if (newSum.eq(cumulativeSum)) break; // Break if cost no longer increases
    prevSum = cumulativeSum;
    cumulativeSum = newSum;
    if (cumulativeSum.gte(money)) break;
  }
  let totalCost = baseCost.add(cumulativeSum);
  if (money.lt(totalCost)) {
    low = low.sub(1);
    totalCost = cumulativeSum;
    if (money.lt(totalCost)) {
      low = low.sub(1);
      totalCost = prevSum;
    }
  }
  return { quantity: low, purchasePrice: Decimal.min(totalCost, money) };
};


window.bulkBuyTetraBinarySearch = function bulkBuyTetraBinarySearch(money, costInfo, alreadyBought) {
  const { costFunction, invCostFunction } = costInfo;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative !== undefined ? costInfo.cumulative : true;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel;

  // Early exit if insufficient funds for the first upgrade
  if (money.lt(firstCost)) return null;

  let low, high;
  if (invCostFunction) {
    const can = invCostFunction(money).floor().add(1).sub(alreadyBought);
    if (can.eq(1)) return { quantity: Decimal.dOne, purchasePrice: firstCost };
    low = slog2add1(can);
  } else {
    high = Decimal.dOne;
    let nextCost;
    do {
      high = high.mul(2);
      nextCost = costFunction(Decimal.add(alreadyBought, tet2sub1(high)).sub(1));
    } while (money.gte(nextCost));
    if (high.eq(2)) {
      return { quantity: Decimal.dOne, purchasePrice: firstCost };
    }
    low = high.div(2);
    if (high.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

    // Simplified binary search with a tolerance check for tetra values
    while (Decimal.gt_tolerance(high, low, 1 / 4e15)) {
      const mid = low.add(high).div(2);
      const midCost = costFunction(Decimal.add(alreadyBought, tet2sub1(mid)).sub(1));
      if (money.gte(midCost)) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // Cap the quantity by the max level, if specified
  if (maxLevel) {
    low = Decimal.min(slog2add1(maxLevel.sub(alreadyBought)), low);
  }
  const baseCost = costFunction(Decimal.add(alreadyBought, tet2sub1(low).sub(1)));
  if (!isCumulative) {
    return { quantity: tet2sub1(low).floor(), purchasePrice: Decimal.min(baseCost, money) };
  }

  // Optimized cumulative cost calculation for tetra purchases
  let cumulativeSum = Decimal.dZero, count = 0;
  const tetrateValue = tet2sub1(low).sub(1);
  for (let i = tetrateValue; i.gt(0); i = i.sub(1)) {
    const newCost = cumulativeSum.add(costFunction(Decimal.add(alreadyBought, i).sub(1)));
    if (newCost.eq(cumulativeSum)) break;
    cumulativeSum = newCost;
    if (++count > 1000) throw new Error("unexpected long loop (buggy cost function?)");
  }
  let totalCost = baseCost.add(cumulativeSum);
  if (money.lt(totalCost)) {
    low = slog2add1(tetrateValue.sub(1));
    totalCost = cumulativeSum;
  }
  return { quantity: tet2sub1(low).floor(), purchasePrice: Decimal.min(totalCost, money) };
};


// Helper functions (assumed to rely on existing implementations of tet10 and slog10)
function tet2sub1(x) {
  return tet10(x.sub(1)).log10().pow2();
}

function slog2add1(x) {
  return slog10(x.log2().pow10()).add(1);
}
