window.bulkBuyBinarySearch = function bulkBuyBinarySearch(money, costInfo, alreadyBought) {
  const costFunction = costInfo.costFunction;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative === undefined ? true : costInfo.cumulative;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel
  if (money.lt(firstCost)) return null;
  // Attempt to find the max we can purchase. We know we can buy 1, so we try 2, 4, 8, etc
  // to figure out the upper limit
  let cantBuy = new Decimal(1);
  let nextCost;
  let max = false;
  do {
    cantBuy = cantBuy.mul(2);
    nextCost = costFunction(Decimal.add(alreadyBought, cantBuy).sub(1));
    if (money.gte(nextCost) && Decimal.add(alreadyBought, cantBuy).gte(maxLevel) && maxLevel) max = true
  } while (money.gte(nextCost) && !max);

  // Deal with the simple case of buying just one
  if (cantBuy.eq(2)) {
    return { quantity: new Decimal(1), purchasePrice: firstCost };
  }

  // The amount we can actually buy is in the interval [canBuy/2, canBuy), we do a binary search
  // to find the exact value:
  let canBuy = cantBuy.div(2);

  if (cantBuy.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

  while (Decimal.sub(cantBuy, canBuy).gt(1)) {
    const middle = Decimal.floor((canBuy.add(cantBuy)).div(2));
    if (money.gte(costFunction(Decimal.add(alreadyBought, middle).sub(1)))) {
      canBuy = middle;
    } else {
      cantBuy = middle;
    }
  }
  if (maxLevel) canBuy = Decimal.min(maxLevel.sub(alreadyBought), canBuy)
  const baseCost = costFunction(Decimal.add(alreadyBought, canBuy).sub(1));
  if (!isCumulative) {
    return { quantity: canBuy, purchasePrice: baseCost };
  }
  let otherCost = new Decimal(0);
  // Account for costs leading up to that purchase; we are basically adding things
  // up until they are insignificant
  let count = 0;
  for (let i = canBuy.sub(1); i.gt(0); i = i.sub(1)) {
    const newCost = otherCost.plus(costFunction(Decimal.add(alreadyBought, i).sub(1)));
    if (newCost.eq(otherCost)) break;
    otherCost = newCost;
    if (++count > 1000) throw new Error("unexpected long loop (buggy cost function?)");
  }
  let totalCost = baseCost.plus(otherCost);
  // Check the purchase price again
  if (money.lt(totalCost)) {
    canBuy = canBuy.sub(1);
    // Since prices grow rather steeply, we can safely assume that we can, indeed, buy
    // one less (e.g. if prices were A, B, C, D, we could afford D, but not A+B+C+D; we
    // assume we can afford A+B+C because A+B+C < D)
    totalCost = otherCost;
  }
  return { quantity: canBuy, purchasePrice: totalCost };
}

window.bulkBuyTetraBinarySearch = function bulkBuyTetraBinarySearch(money, costInfo, alreadyBought) {
  const costFunction = costInfo.costFunction;
  const firstCost = costInfo.firstCost === undefined ? costFunction(alreadyBought) : costInfo.firstCost;
  const isCumulative = costInfo.cumulative === undefined ? true : costInfo.cumulative;
  const maxLevel = typeof costInfo.maxLevel === "function" ? costInfo.maxLevel() : costInfo.maxLevel
  if (money.lt(firstCost)) return null;
  // Attempt to find the max we can purchase. We know we can buy 1, so we try 2, 4, 8, etc
  // to figure out the upper limit
  let cantBuy = new Decimal(1);
  let nextCost;
  do {
    cantBuy = cantBuy.mul(2);
    nextCost = costFunction(Decimal.add(alreadyBought, Decimal.tetrate(2, cantBuy.sub(1))).sub(1));
  } while (money.gte(nextCost));
  // Deal with the simple case of buying just one
  if (cantBuy.eq(2)) {
    return { quantity: new Decimal(1), purchasePrice: firstCost };
  }
  // The amount we can actually buy is in the interval [canBuy/2, canBuy), we do a binary search
  // to find the exact value:
  let canBuy = cantBuy.div(2);
  if (cantBuy.gte(Decimal.dLayerSafeMax)) throw new Error("Overflow in binary search");

  while (Decimal.gt_tolerance(cantBuy, canBuy, 1 / 4e15)) {
    const middle = (canBuy.add(cantBuy)).div(2);
    if (money.gte(costFunction(Decimal.add(alreadyBought, Decimal.tetrate(2, middle.sub(1))).sub(1)))) {
      canBuy = middle;
    } else {
      cantBuy = middle;
    }
  }
  if (maxLevel) {
    canBuy = Decimal.min(maxLevel.sub(alreadyBought).slog(2).add(1), canBuy)
  }
  const baseCost = costFunction(Decimal.add(alreadyBought, Decimal.tetrate(2, canBuy.sub(1))).sub(1));
  if (!isCumulative) {
    return { quantity: Decimal.tetrate(2, canBuy.sub(1)).floor(), purchasePrice: baseCost };
  }
  let otherCost = new Decimal(0);
  // Account for costs leading up to that purchase; we are basically adding things
  // up until they are insignificant
  let count = 0;
  for (let i = Decimal.tetrate(2, canBuy.sub(1)).sub(1); i.gt(0); i = i.sub(1)) {
    const newCost = otherCost.plus(costFunction(Decimal.add(alreadyBought, i).sub(1)));
    if (newCost.eq(otherCost)) break;
    otherCost = newCost;
    if (++count > 1000) throw new Error("unexpected long loop (buggy cost function?)");
  }
  let totalCost = baseCost.plus(otherCost);
  // Check the purchase price again
  if (money.lt(totalCost)) {
    canBuy = Decimal.tetrate(2, canBuy.sub(1)).sub(1);
    canBuy = canBuy.slog(2).add(1)
    // Since prices grow rather steeply, we can safely assume that we can, indeed, buy
    // one less (e.g. if prices were A, B, C, D, we could afford D, but not A+B+C+D; we
    // assume we can afford A+B+C because A+B+C < D)
    totalCost = otherCost;
  }
  return { quantity: Decimal.tetrate(2, canBuy.sub(1)).floor(), purchasePrice: totalCost };
}