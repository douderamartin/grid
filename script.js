var GRID_SIZE = 20;
var mapData = [];
var TILE_TYPES = ['grass', 'road', 'water'];

function initMap() {
  mapData = [];
  for (var i = 0; i < GRID_SIZE; i++) {
    mapData[i] = [];
    for (var j = 0; j < GRID_SIZE; j++) {
      mapData[i][j] = 'grass';
    }
  }
}

function renderGrid() {
  var grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (var i = 0; i < GRID_SIZE; i++) {
    var row = document.createElement('div');
    row.className = 'grid-row';
    for (var j = 0; j < GRID_SIZE; j++) {
      var tile = document.createElement('div');
      tile.className = 'tile ' + mapData[i][j];
      tile.dataset.row = i;
      tile.dataset.col = j;
      tile.onclick = function() {
        cycleTile(parseInt(this.dataset.row), parseInt(this.dataset.col));
      };
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
}

function cycleTile(row, col) {
  var idx = TILE_TYPES.indexOf(mapData[row][col]);
  mapData[row][col] = TILE_TYPES[(idx + 1) % TILE_TYPES.length];
  renderGrid();
}

//localStorage

function getSaved() {
  return JSON.parse(localStorage.getItem('trackbuilder_maps') || '{}');
}

function saveMap() {
  var name = document.getElementById('map-name').value.trim();
  if (!name) { alert('Zadej název mapy!'); return; }
  var saved = getSaved();
  saved[name] = mapData;
  localStorage.setItem('trackbuilder_maps', JSON.stringify(saved));
  alert('Uloženo: ' + name);
}

function loadMap(name) {
  var saved = getSaved();
  if (saved[name]) {
    mapData = saved[name];
    document.getElementById('map-name').value = name;
    showEditor(false);
    renderGrid();
  }
}

function deleteMap(name) {
  if (!confirm('Smazat mapu "' + name + '"?')) return;
  var saved = getSaved();
  delete saved[name];
  localStorage.setItem('trackbuilder_maps', JSON.stringify(saved));
  showLoadMenu();
}

//Export/Import

function exportMap() {
  var name = document.getElementById('map-name').value.trim() || 'mapa';
  var data = JSON.stringify({ name: name, grid: mapData }, null, 2);
  var blob = new Blob([data], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name + '.json';
  a.click();
}

function importMap() {
  document.getElementById('import-input').click();
}

function handleImport(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      mapData = data.grid;
      document.getElementById('map-name').value = data.name || 'importovana';
      showEditor(false);
      renderGrid();
    } catch(err) {
      alert('Chyba při importu: neplatný soubor');
    }
  };
  reader.readAsText(file);
  //reset input
  event.target.value = '';
}

//Obrazovky

function showLoadMenu() {
  var saved = getSaved();
  var list = document.getElementById('load-list');
  list.innerHTML = '<h3>Uložené mapy:</h3>';
  var keys = Object.keys(saved);
  if (keys.length === 0) {
    list.innerHTML += '<p>Žádné uložené mapy.</p>';
    return;
  }
  keys.forEach(function(name) {
    var div = document.createElement('div');
    div.className = 'map-entry';

    var btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = function() { loadMap(name); };

    var del = document.createElement('button');
    del.textContent = 'Smazat';
    del.className = 'btn-delete';
    del.onclick = function() { deleteMap(name); };

    div.appendChild(btn);
    div.appendChild(del);
    list.appendChild(div);
  });
}

function showEditor(isNew) {
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('editor-screen').style.display = 'block';
  if (isNew) {
    initMap();
    document.getElementById('map-name').value = '';
  }
  renderGrid();
}

function showMenu() {
  document.getElementById('editor-screen').style.display = 'none';
  document.getElementById('menu-screen').style.display = 'block';
  document.getElementById('load-list').innerHTML = '';
}
