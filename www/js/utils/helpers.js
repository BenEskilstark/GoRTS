
export const arrayToMapKeys = (arr, keyFn) => {
  const map = {};
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    map[key] = keyFn(key, i);
  }
  return map;
}
