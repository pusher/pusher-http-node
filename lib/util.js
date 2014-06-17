function toOrderedArray(map) {
  return Object.keys(map).map(function(key) {
    return [key, map[key]];
  }).sort(function(a, b) {
    return a[0] > b[0];
  }).map(function(pair) {
    return pair[0] + "=" + pair[1];
  });
}

exports.toOrderedArray = toOrderedArray;
