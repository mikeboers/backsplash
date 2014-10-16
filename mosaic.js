
var Mosaic = function(width) {
    this.width = width;
    this.height = 0;
    this.tiles = []
    this.holes = []
}


Mosaic.prototype.place = function(obj) {
    this.tiles.push(obj);
    this.occupy(obj);
}


Mosaic.prototype.append = function(w, h) {

    var obj = this.find(w, h);
    obj.width = w;
    obj.height = h;

    this.occupy(obj);

    obj.index = this.tiles.length;
    this.tiles.push(obj)

    return obj;
}


Mosaic.prototype.find = function(w, h) {

    for (var r = 0; r < this.holes.length; r++) {
        for (var c = 0; c < this.width; c++) {
            if (this.holes[r] && this.holes[r][c]) {
                if (this._fits(w, h, r, c)) {
                    return {row: r, col: c};
                }
            }
        }
    }

    return {row: this.holes.length, col: 0};
}


Mosaic.prototype._fits = function(w, h, r, c) {
    // console.log('fits', {width: w, height: h, row: r, col: c});
    for (var R = r; R < r + h; R++) {
        for (var C = c; C < c + w; C++) {
            // console.log('fits', {width: w, height: h, row:r, col:c, R:R, C:C, hole:this.holes[R] && !this.holes[R][C]})
            if (R < this.holes.length && (!this.holes[R] || !this.holes[R][C])) {
                return false;
            }
        }
    }
    return true;
}


Mosaic.prototype.occupy = function(obj) {

    while (this.holes.length < obj.row + obj.height + 2) {
        var row = [];
        for (var i = 0; i < this.width; i++) {
            row.push(true);
        }
        this.holes.push(row);
    }

    for (var r = obj.row; r < obj.row + obj.height; r++) {
        
        if (!this.holes[r]) {
            throw "invalid row " + r;
        }

        for (var c = obj.col; c < obj.col + obj.width; c++) {
            this.holes[r][c] = false;
        }

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


if (module) {
    module.exports = {
        Mosaic: Mosaic
    }
}
