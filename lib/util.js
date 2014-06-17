function toOrderedArray(map) {
  var items = [];
  for (var name in map) {
    items.push(name + '=' + map[ name ]);
  }
  items.slice(0).sort(function(a, b) {
    return a - b;
  });
  return items;
}

exports.toOrderedArray = toOrderedArray;
