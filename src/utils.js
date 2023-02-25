exports.filterMatket = (market) =>
  Object.fromEntries(
    Object.entries(market).filter(([key]) => key.endsWith("BUSD"))
  );
