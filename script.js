const MAX = 25;
const wall = Number.MAX_SAFE_INTEGER;
const person = Number.MAX_SAFE_INTEGER - 1;
const empty_place = 0;
var people = [];
var pause = true;
var paths = [];
var panic;
var grid;
var exit;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reset() {
    for (let i = 0; i < MAX; i++) {
        paths[i] = [];
        for (let j = 0; j < MAX; j++) {
            if (!(i == 0 && j == 0) && (i == 0 || i == MAX - 1 || j == 0 || j == MAX - 1))
                paths[i][j] = wall;
            else
                paths[i][j] = empty_place;
        }
    }
    let first_time = (grid == undefined) ? true : false;
    grid = clickableGrid(MAX, MAX, function (el, row, col, i) {
        // console.log(paths);
        if (pause) {
            if (row == 0 || row == MAX - 1 || col == 0 || col == MAX - 1) {
                black_boarder();
                ccc(row, col, '');
                paths_boarder(row, col);
                exit = [row, col];
            } else switch (el.className) {
                case 'wall':
                    paths[row][col] = person;
                    el.className = 'person';
                    break;
                case 'person':
                    paths[row][col] = empty_place;
                    el.className = '';
                    break;
                default:
                    paths[row][col] = wall;
                    el.className = 'wall';
            }
        }
    });
    if (first_time)
        document.body.appendChild(grid);
    else {
        let old_elem = document.getElementsByClassName('grid')[0];
        old_elem.parentNode.replaceChild(grid, old_elem);
    }
    black_boarder();
    ccc(0, 0, '');
    exit = [0, 0];
}

reset();


function clickableGrid(rows, cols, callback) {
    var i = 0;
    var grid = document.createElement('table');
    grid.className = 'grid';
    for (var r = 0; r < rows; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c = 0; c < cols; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            cell.addEventListener('click', (function (el, r, c, i) {
                return function () {
                    callback(el, r, c, i);
                }
            })(cell, r, c, i), false);
        }
    }
    return grid;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function simul() {
    if (pause)
        return;
    setTimeout(simul, 500);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function contains(arr, match) {
    for (let i = 0; i < arr.length; i++) {
        let eq = true;
        for (let j = 0; j < arr[i].length; j++)
            if (arr[i][j] != match[j]) {
                eq = false;
                break;
            }
        if (eq)
            return true;
    }
    return false;
}

function black_boarder() {
    for (let i = 0; i < MAX; i++) {
        ccc(i, 0, 'wall');
        ccc(0, i, 'wall');
        ccc(i, MAX - 1, 'wall');
        ccc(MAX - 1, i, 'wall');
    }
}

function paths_boarder(r, c) {
    for (let i = 0; i < MAX; i++) {
        paths[i][0] = wall;
        paths[0][i] = wall;
        paths[i][MAX - 1] = wall;
        paths[MAX - 1][i] = wall;
    }
    paths[r][c] = empty_place;
}


//change cell class
function ccc(r, c, cl) {
    let cell = document.getElementsByClassName('grid')[0].rows[r].cells[c];
    cell.className = cl;
}