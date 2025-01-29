window.bulkBuyBinarySearch = function bulkBuyBinarySearch(money, costInfo, alreadyBought) {
  const costFunction = costInfo.costFunction;
  const invCostFunction = costInfo.invCostFunction;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative !== undefined ? costInfo.cumulative : true;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel;

  // Early exit if not enough money for the first upgrade
  if (money.lt(firstCost)) return null;

  // Exponentially increase cantBuy to find the upper limit
  let cantBuy = Decimal.dOne;
  let canBuy;

  if (invCostFunction) {
    canBuy = invCostFunction(money).floor().add(1).sub(alreadyBought);
  } else {
    let nextCost;
    let maxReached = false;

    do {
      cantBuy = cantBuy.mul(2);
      nextCost = costFunction(Decimal.add(alreadyBought, cantBuy).sub(1));
      if (money.gte(nextCost) && Decimal.add(alreadyBought, cantBuy).gte(maxLevel) && maxLevel) {
        maxReached = true;
      }
    } while (money.gte(nextCost) && !maxReached);

    // If only one upgrade can be bought
    if (cantBuy.eq(2)) {
      return { quantity: Decimal.dOne, purchasePrice: firstCost };
    }

    // Binary search for the exact value we can afford
    canBuy = cantBuy.div(2);
    if (cantBuy.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

    // Perform binary search to narrow down the purchasable quantity
    while (cantBuy.sub(canBuy).gt(1)) {
      const middle = Decimal.floor((canBuy.add(cantBuy)).div(2));
      const costAtMiddle = costFunction(Decimal.add(alreadyBought, middle).sub(1));
      if (money.gte(costAtMiddle)) {
        canBuy = middle;
      } else {
        cantBuy = middle;
      }
    }
  }

  // Ensure we don't exceed the max level
  if (maxLevel) {
    canBuy = Decimal.min(maxLevel.sub(alreadyBought), canBuy);
  }

  const baseCost = costFunction(Decimal.add(alreadyBought, canBuy.sub(1)));

  if (!isCumulative) {
    return { quantity: canBuy, purchasePrice: baseCost.min(money) };
  }

  // Calculate cumulative cost if applicable
  let totalCost = baseCost;
  let costAccumulator = Decimal.dZero;
  let costAccumulator2 = Decimal.dZero;

  for (let i = canBuy.sub(1); i.gt(0); i = i.sub(1)) {
    const newCost = costAccumulator.plus(costFunction(Decimal.add(alreadyBought, i).sub(1)));
    if (newCost.eq(costAccumulator)) break; // Break if the cost doesn't change
    costAccumulator2 = costAccumulator
    costAccumulator = newCost;
    if (costAccumulator.gte(money)) break; // Stop if cost exceeds available money
  }

  totalCost = baseCost.plus(costAccumulator);

  if (money.lt(totalCost)) {
    canBuy = canBuy.sub(1);
    totalCost = costAccumulator;
    if (money.lt(totalCost)) {
      canBuy = canBuy.sub(1);
      totalCost = costAccumulator2;
    }
  }
  //console.log(format(totalCost))

  return { quantity: canBuy, purchasePrice: totalCost.min(money) };
};

window.bulkBuyTetraBinarySearch = function bulkBuyTetraBinarySearch(money, costInfo, alreadyBought) {
  const costFunction = costInfo.costFunction;
  const invCostFunction = costInfo.invCostFunction;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative !== undefined ? costInfo.cumulative : true;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel;

  // Early exit if not enough money for the first upgrade
  if (money.lt(firstCost)) return null;

  // Exponentially increase cantBuy to find the upper limit for tetrational purchases
  let cantBuy = Decimal.dOne;
  let canBuy;

  if (invCostFunction) {
    let can = invCostFunction(money).floor().add(1).sub(alreadyBought);
    if (can.eq(1)) {
      return { quantity: Decimal.dOne, purchasePrice: firstCost };
    }
    canBuy = slog2add1(can);
  } else {
    let nextCost;

    do {
      cantBuy = cantBuy.mul(2);
      nextCost = costFunction(Decimal.add(alreadyBought, tet2sub1(cantBuy)).sub(1));
    } while (money.gte(nextCost));

    // If only one upgrade can be bought
    if (cantBuy.eq(2)) {
      return { quantity: Decimal.dOne, purchasePrice: firstCost };
    }

    // Binary search for the exact amount we can afford
    canBuy = cantBuy.div(2);
    if (cantBuy.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

    // Simplified binary search with optimized tolerance
    while (Decimal.gt_tolerance(cantBuy, canBuy, 1 / 4e15)) {
      const middle = canBuy.add(cantBuy).div(2);
      const middleCost = costFunction(Decimal.add(alreadyBought, tet2sub1(middle)).sub(1));

      if (money.gte(middleCost)) {
        canBuy = middle;
      } else {
        cantBuy = middle;
      }
    }
  }

  // Ensure we don't exceed the max level
  if (maxLevel) {
    canBuy = Decimal.min(slog2add1(maxLevel.sub(alreadyBought)), canBuy);
  }

  // Calculate base cost and avoid recalculating too many times
  const baseCost = costFunction(Decimal.add(alreadyBought, tet2sub1(canBuy).sub(1)));
  if (!isCumulative) {
    return { quantity: tet2sub1(canBuy).floor(), purchasePrice: baseCost.min(money) };
  }

  // Calculate cumulative cost (if applicable) in an optimized way
  let otherCost = Decimal.dZero;
  let count = 0;
  let tetrateValue = tet2sub1(canBuy).sub(1);

  for (let i = tetrateValue; i.gt(0); i = i.sub(1)) {
    const newCost = otherCost.plus(costFunction(Decimal.add(alreadyBought, i).sub(1)));
    if (newCost.eq(otherCost)) break; // Break if the cost doesn't change
    otherCost = newCost;
    if (++count > 1000) throw new Error("unexpected long loop (buggy cost function?)");
  }

  let totalCost = baseCost.plus(otherCost);

  if (money.lt(totalCost)) {
    canBuy = slog2add1(tetrateValue.sub(1));
    totalCost = otherCost;
  }

  return { quantity: tet2sub1(canBuy).floor(), purchasePrice: totalCost.min(money) };
};

// Helper functions
function tet2sub1(x) {
  return tet10(x.sub(1)).log10().pow2();
}

function slog2add1(x) {
  return slog10(x.log2().pow10()).add(1);
}
