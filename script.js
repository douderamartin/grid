var GRID_SIZE = 20;
var mapData = [];
var selectedTile = 'grass';
var isPainting = false;

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

      tile.onmousedown = function(e) {
        e.preventDefault();
        isPainting = true;
        paintTile(parseInt(this.dataset.row), parseInt(this.dataset.col));
      };
      tile.onmouseenter = function() {
        if (isPainting) {
          paintTile(parseInt(this.dataset.row), parseInt(this.dataset.col));
        }
      };

      row.appendChild(tile);
    }
    grid.appendChild(row);
  }

  document.onmouseup = function() { isPainting = false; };
}

function paintTile(row, col) {
  if (mapData[row][col] === selectedTile) return;
  mapData[row][col] = selectedTile;
  // Aktualizujeme jen ten jeden tile místo celého gridu
  var tiles = document.querySelectorAll('.tile');
  var index = row * GRID_SIZE + col;
  tiles[index].className = 'tile ' + selectedTile;
}

function selectTile(type) {
  selectedTile = type;
  var btns = document.querySelectorAll('.palette-btn');
  btns.forEach(function(btn) { btn.classList.remove('active'); });
  event.target.classList.add('active');
}

// --- localStorage ---

function getSaved() {
  return JSON.parse(localStorage.getItem('trackbuilder_maps') || '{}');
}

function saveMap() {
  var name = document.getElementById('map-name').value.trim();
  if (!name) { alert('Zadej název mapy!'); return; }
  var saved = getSaved();
  saved[name] = { grid: mapData, size: GRID_SIZE };
  localStorage.setItem('trackbuilder_maps', JSON.stringify(saved));
  alert('Uloženo: ' + name);
}

function loadMap(name) {
  var saved = getSaved();
  if (saved[name]) {
    var data = saved[name];
    // zpětná kompatibilita - starší formát
    if (Array.isArray(data)) {
      mapData = data;
      GRID_SIZE = mapData.length;
    } else {
      mapData = data.grid;
      GRID_SIZE = data.size || mapData.length;
    }
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

// --- Export / Import ---

function exportMap() {
  var name = document.getElementById('map-name').value.trim() || 'mapa';
  var data = JSON.stringify({ name: name, size: GRID_SIZE, grid: mapData }, null, 2);
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
      GRID_SIZE = data.size || mapData.length;
      document.getElementById('map-name').value = data.name || 'importovana';
      showEditor(false);
      renderGrid();
    } catch(err) {
      alert('Chyba při importu: neplatný soubor');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// --- Obrazovky ---

function startNewMap() {
  var sizeInput = document.getElementById('grid-size-input');
  var size = parseInt(sizeInput.value);
  if (isNaN(size) || size < 5 || size > 40) {
    alert('Velikost gridu musí být 5–40');
    return;
  }
  GRID_SIZE = size;
  showEditor(true);
}

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
