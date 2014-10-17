

var backsplash = (function(){

function clone(obj) {

    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = {}; // obj.constructor();

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = obj[key];
        }
    }
    return temp;

}


var Layout = function(opts) {

    this.opts = clone(opts || {});

    this.width = this.opts.width || 5;
    this.tile_size = this.opts.tile_size || 100;
    this.padding = this.opts.padding || 0;

    this.tiles = [];
    this.holes = [];

}


Layout.prototype.css = function(tile) {
    return {
        'top': tile.row * (this.tile_size + this.padding),
        'left': tile.col * (this.tile_size + this.padding),
        'height': tile.height * (this.tile_size + this.padding) - this.padding,
        'width': tile.width * (this.tile_size + this.padding) - this.padding,
    }
}


Layout.prototype.linearize = function() {
    var res = []
    var seen = {}
    for (var row = 0; row < this.tiles.length; row++) {
        for (var col = 0; col < this.width; col++) {
            var tile = this.tiles[row][col];
            if (!tile) {
                continue;
            }
            var key = this.width * tile.row + tile.col;
            if (!seen[key]) {
                res.push(tile);
                seen[key] = true;
            }
        }
    }
    return res;
}


Layout.prototype.add = function(tile, opts) {

    tile = clone(tile);
    opts = opts ? opts : {};

    if (opts.ignore_position) {
        tile.row = tile.col = null;
    }

    if (!(typeof(tile.row) === "number" && typeof(tile.col) === "number")) {
        this._find_hole(tile);
    }
    this.occupy(tile);
    return tile;

}


Layout.prototype._find_hole = function(tile) {

    for (var r = 0; r < this.holes.length; r++) {
        for (var c = 0; c < this.width; c++) {
            if (this.holes[r] && this.holes[r][c]) {
                if (this._fits_holes(tile, r, c)) {
                    tile.row = r;
                    tile.col = c;
                    return tile;
                }
            }
        }
    }

    tile.row = this.holes.length;
    tile.col = 0;
    return tile;

}


Layout.prototype._fits_holes = function(tile, r, c) {
    for (var R = r; R < r + tile.height; R++) {
        for (var C = c; C < c + tile.width; C++) {
            if (R < this.holes.length && (!this.holes[R] || !this.holes[R][C])) {
                return false;
            }
        }
    }
    return true;
}


Layout.prototype.occupy = function(tile) {

    while (this.holes.length < tile.row + tile.height + 2) {
        var holes = [];
        var tiles = [];
        for (var i = 0; i < this.width; i++) {
            holes.push(true);
            tiles.push(null);
        }
        this.holes.push(holes);
        this.tiles.push(tiles)
    }

    for (var r = tile.row; r < tile.row + tile.height; r++) {
        
        if (!this.holes[r] || !this.tiles[r]) {
            throw "invalid row " + r;
        }

        for (var c = tile.col; c < tile.col + tile.width; c++) {
            this.holes[r][c] = false;
            this.tiles[r][c] = tile;
        }

        // Here is the only real different between them.
        var empty = true;
        for (var c = 0; c < this.width; c++) {
            if (this.holes[r][c]) {
                empty = false;
                break;
            }
        }
        if (empty) {
            this.holes[r] = null;
        }

    }



}


return {
    _clone: clone,
    Layout: Layout
}

})();


if (typeof window === 'undefined') {
    module.exports = backsplash
}

