function reduceToDictionaryById(dictionary, obj) {
  dictionary[obj.id] = obj;
  return dictionary;
}

function packContainsMonster(pack, monsterId) {
  var f, i;
  for (var f = 0; f < pack.formations.length; f++) {
    if (!pack.formations[f] || !pack.formations[f].length) {
      continue;
    }
    for (var i = 0; i < pack.formations[f].length; i++) {
      if (pack.formations[f][i] === monsterId) {
        return true;
      }
    }
  }
  return false;
}

var packs = require('./pack-list');
var packsById = packs.reduce(reduceToDictionaryById, {});

var bestiary = require('./bestiary');
var bestiaryById = bestiary.reduce(reduceToDictionaryById, {});

var packIdsByMonsterId = bestiary.reduce(function(dictionary, monster) {
  var packsContainingMonster = packs.filter(function(pack) {
    return packContainsMonster(pack, monster.id);
  }).map(function(pack) {
    return pack.id;
  });
  dictionary[monster.id] = packsContainingMonster;
  return dictionary;
}, {});

module.exports = {
  packs: packs,
  packsById: packsById,
  bestiary: bestiary,
  bestiaryById: bestiaryById,
  packIdsByMonsterId: packIdsByMonsterId,
  util: {
    formatName: function(monster) {
      if (monster.description) {
        return monster.name + ' (' + monster.description + ')';
      }
      return monster.name;
    },
    getMonster: function(id) { return bestiaryById[id]; },
    getPack: function(id) { return packsById[id]; },
    packsForMonster: function(id) { return packIdsByMonsterId[id]; }
  }
};
