const MAX = 25;
const wall = Number.MAX_SAFE_INTEGER;
const empty_place = 0;
var people;
var pause = true;
var paths;
var panic;
var grid;
var exit;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reset() {
    people = [];
    paths = [];
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
        if (pause) {
            if (row == 0 || row == MAX - 1 || col == 0 || col == MAX - 1) {
                black_boarder();
                ccc(row, col, '');
                paths_boarder(row, col);
                exit = new Position(row, col);
            } else switch (el.className) {
                case 'wall':
                    paths[row][col] = empty_place;
                    el.className = 'person';
                    people.push(new Position(row, col));
                    break;
                case 'person':
                    paths[row][col] = empty_place;
                    el.className = '';
                    delete_person(row, col);
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
    for (let ink = 0; ink < people.length; ink++) {
        let r = people[ink].row;
        let c = people[ink].col;
        if (Math.random() < panic) { //panic mode
            console.log("SZALONY");
            let aval_mv = [];
            for (let i = -1; i < 2; i++)
                for (let j = -1; j < 2; j++)
                    if (i != j && paths[r + i][c + j] < wall && !contains(people, new Position(r + i, c + j)))
                        aval_mv.push(new Position(r + i, c + j));
            if (aval_mv.length > 0) {
                let i = Math.floor(Math.random() * aval_mv.length);
                // console.log(i + " " + aval_mv.length);
                // console.log(people);
                people[ink] = aval_mv[i];
                ccc(r, c, '');
                if (aval_mv[i].row != exit.row || aval_mv[i].col != exit.col)
                    ccc(aval_mv[i].row, aval_mv[i].col, 'person');
                else
                    delete_person(aval_mv[i].row, aval_mv[i].col);
            }
        } else { //reasonable mode
            console.log("NORMALNY");
            let mv = new Position(r, c);
            let val = paths[r][c];
            for (let i = -1; i < 2; i++)
                for (let j = -1; j < 2; j++)
                    if (i != j && paths[r + i][c + j] < val && !contains(people, new Position(r + i, c + j))) {
                        val = paths[r + i][c + j];
                        mv = new Position(r + i, c + j);
                    }
            if (val < paths[r][c]) {
                ccc(r, c, '');
                if (mv.row != exit.row || mv.col != exit.col){
                    ccc(mv.row, mv.col, 'person');
                    people[ink]= new Position(mv.row, mv.col);
                }else
                    delete_person(r, c);
            }
        }
    }
    setTimeout(simul, 1000);
}

function fill_weights() {
    let nextpos = [exit];
    write_weight(exit.row, exit.col, 0);
    while (nextpos.length > 0) {
        let nxt = nextpos.shift();
        let basic = [[1, 1, 1], [1, 0, 1], [1, 1, 1]];
        if (nxt.row == 0) {
            let tmp = [[0, 0, 0], [1, 0, 1], [1, 1, 1]];
            conj(basic, tmp);
        }
        if (nxt.row == MAX - 1) {
            tmp = [[1, 1, 1], [1, 0, 1], [0, 0, 0]];
            conj(basic, tmp);
        }
        if (nxt.col == 0) {
            tmp = [[0, 1, 1], [0, 0, 1], [0, 1, 1]];
            conj(basic, tmp);
        }
        if (nxt.col == MAX - 1) {
            let tmp = [[1, 1, 0], [1, 0, 0], [1, 1, 0]];
            conj(basic, tmp);
        }
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if (basic[i][j]) {
                    let x = nxt.row + i - 1;
                    let y = nxt.col + j - 1;
                    if (x == exit.row && y == exit.col)
                        continue;
                    if (paths[x][y] == 0) {
                        if (Math.sqrt(Math.pow(x - nxt.row, 2) + Math.pow(y - nxt.col, 2)) > 1)
                            paths[x][y] = paths[nxt.row][nxt.col] + 1.5;
                        else
                            paths[x][y] = paths[nxt.row][nxt.col] + 1;
                        write_weight(x, y, paths[x][y]);
                        nextpos.push(new Position(x, y));
                    }
                }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function conj(m1, m2) {
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            m1[i][j] = m1[i][j] & m2[i][j];
}

function contains(arr, match) {
    for (let i = 0; i < arr.length; i++)
        if (arr[i].row == match.row && arr[i].col == match.col)
            return true;
    return false;
}

function delete_person(r, c) {
    for (let i = 0; i < people.length; i++)
        if (people[i].row == r && people[i].col == c) {
            people.splice(i, 1);
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

function write_weight(r, c, w) {
    let cell = document.getElementsByClassName('grid')[0].rows[r].cells[c];
    cell.innerHTML = w;
}

function Position(r, c) {
    this.row = r;
    this.col = c;
}