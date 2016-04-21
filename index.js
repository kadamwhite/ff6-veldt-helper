require('./styles.styl');

var d3 = require('d3');
var flatten = require('lodash.flatten');
var uniq = require('lodash.uniq');
var debounce = require('lodash.debounce');

var data = require('./data');
var bestiary = data.bestiary;
var getMonster = data.util.getMonster;
var formatName = data.util.formatName;
var packsForMonster = data.util.packsForMonster;
var getPack = data.util.getPack;

var body = d3.select('body');

function keyById(d) { return d.id; }

function bindData(data) {
  return function(selection) {
    return selection.data(data, function(d) {
      return d.id;
    });
  };
}

var packList = body.append('ul');

// Takes an array of IDs
function formationText(formation) {
  var counts = formation.reduce(function(counts, id) {
    counts[id] = counts[id] || 0;
    counts[id]++;
    return counts;
  }, {});
  return Object.keys(counts).map(function(id) {
    var count = counts[id];
    var monster = getMonster(id);
    var name = formatName(monster);
    return count > 1 ? name + ' x ' + count : name;
  }).join(', ');
}

function addEmpty(selection) {
  selection.append('li').text('Empty');
}

function setPackData(packs) {
  var packs = packList.selectAll('li').data(packs, keyById);

  packs.exit().remove();

  packs.enter().append('li').attr({
    class: 'pack',
    id: function(d) {
      return 'pack-' + d.id;
    }
  }).each(function(d, i) {
    var li = d3.select(this);
    li.append('p').style('font-weight', 'bold').text('Pack ' + d.id);
    li.append('ul');
  });

  packs.each(function(d, i) {
    var formations = d3.select(this).select('ul');

    d.formations.forEach(function(formation) {
      if (!formation.length) {
        formations.call(addEmpty);
        return;
      }
      formations.append('li').text(formationText(formation));
    });

    if (!d.formations || !d.formations.length) {
      formations.call(addEmpty);
    }
  });

  packs.order();
}

function reset() {
  setPackData(data.packs);
}

function updateList() {
  var re = new RegExp(this.value.split('').join('.*'), 'i');
  var matchingMonsters = bestiary.filter(function(monster) {
    return re.test(monster.name);
  });
  var packsForMonsters = matchingMonsters.map(function(monster) {
    return packsForMonster(monster.id);
  });
  var matchingPacks = flatten(uniq(packsForMonsters))
    .sort(d3.ascending)
    .map(getPack);
  setPackData(matchingPacks);
}
var searchBox = d3.select('#monster-name-filter');
searchBox.on('keyup', debounce(updateList, 50));

var resetButton = d3.select('#reset-button');
resetButton.on('click', function() {
  searchBox.property('value', '');
  reset();
})

// Initialize
reset();
