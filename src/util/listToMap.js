const listToMap = list =>
  list.reduce(
    (pValue, cValue, index) => ({ ...pValue, [cValue]: index }),
    {},
  );
export default listToMap;
