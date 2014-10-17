backsplash.Editor = (function(){

var clone = backsplash._clone;


jQuery.fn.backsplashEditor = function(opts) {
    this.each(function() {
        var editor = new Editor(this, opts);
        $(this).data('backsplash-editor', editor);
    })
}


var Editor = function(elem, opts) {

    this.$elem = $(elem);
    this.opts = $.extend({}, this.$elem.data('backsplash'), opts);

    this.selection = []

    $(window).on('keydown.backsplash', $.proxy(this, 'onKeydown'));
    this.$elem.on('mousedown.backsplash', '.backsplash-tile', $.proxy(this, 'onMousedown'));
    this.$elem.on('click.backsplash', '.backsplash-tile', function(e) {
        e.preventDefault();
    });

    var editor = this;
    this.tiles = [];
    this.$elem.children().each(function() {

        var $tile = $(this);

        $tile.addClass('backsplash-tile');

        var tile = $tile.data('tile') || {};
        $tile.data('tile', tile);
        tile.$elem = $tile;

        editor.tiles.push(tile);
    })

}






Editor.prototype.resetTile = function(layout, old_tile, opts) {
    var new_tile = layout.add(old_tile, opts);
    old_tile.$elem.css(layout.css(new_tile));
    old_tile.row = new_tile.row;
    old_tile.col = new_tile.col;
}


Editor.prototype.resetTiles = function() {

    var layout = new backsplash.Layout(this.opts);

    for (var i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].locked) {
            this.resetTile(layout, this.tiles[i].locked)
        }
    }
    for (var i = 0; i < this.tiles.length; i++) {
        if (!this.tiles[i].locked) {
            this.resetTile(layout, this.tiles[i], {ignore_position: true})
        }
    }

    return layout;

}


Editor.prototype.onKeydown = function(e) {

    console.log(e);

    switch (e.which) {

        case 114: // r
            for (var i = 0; i < this.tiles.length; i++) {
                this.tiles[i].locked = null
                this.tiles[i].$elem.removeClass('tile-locked')
                this.tiles[i].$elem.removeClass('tile-selected')
            }
            this.resetTiles();
            break;

        case 38: // up
        case 40: // down
            e.preventDefault()
            for (var i = 0; i < this.selection.length; i++) {
                if (e.metaKey) {
                    this.selection[i].locked.height += e.which == 40 ? 1 : -1;
                    if (this.opts.resized) {
                        this.opts.resized(this.selection[i].locked, this);
                    }
                } else {
                    this.selection[i].locked.row += e.which == 40 ? 1 : -1;
                }
            }
            this.resetTiles();
            break;

        case 37: // left
        case 39: // right
            e.preventDefault()
            for (var i = 0; i < this.selection.length; i++) {
                if (e.metaKey) {
                    this.selection[i].locked.width += e.which == 39 ? 1 : -1;
                    if (this.opts.resized) {
                        this.opts.resized(this.selection[i].locked, this);
                    }
                } else {
                    this.selection[i].locked.col += e.which == 39 ? 1 : -1;
                }
            }
            this.resetTiles();
            break;

        default:
            console.log('unknown key', e.which, e)
    }

}


Editor.prototype.onMousedown = function(e) {

    e.preventDefault();
    this.mousedown = e;

    var $tile = $(e.target).closest('.backsplash-tile');
    var tile = $tile.data('tile');

    console.log($tile, tile);

    $tile.addClass('tile-locked');
    $tile.addClass('tile-selected');
    tile.locked = clone(tile.locked || tile)

    $(window).on('mouseup.backsplash', $.proxy(this, 'onMouseup'));
    $(window).on('mousemove.backsplash', $.proxy(this, 'onMousemove'));

    if (!e.shiftKey) {
        for (var i = 0; i < this.selection.length; i++) {
            this.selection[i].$elem.removeClass('tile-selected');
        }
        this.selection = []
    }
    this.selection.push(tile);

    this.resetTiles();

}


Editor.prototype.onMousemove = function(e) {

    e.preventDefault();

    var origin = this.$elem.offset();
    var x = e.pageX - origin.left - this.mousedown.offsetX;
    var y = e.pageY - origin.top - this.mousedown.offsetY;

    var row = Math.floor(y / (this.opts.tile_size + this.opts.padding) + 0.5);
    var col = Math.floor(x / (this.opts.tile_size + this.opts.padding) + 0.5);

    var tile = this.selection[0];
    var changed = (tile.locked.row != row || tile.locked.col != col);
    tile.locked.row = row;
    tile.locked.col = col;

    if (changed) {
        this.resetTiles();
    }

    this.selection[0].$elem.css({left: x, top: y});

}


Editor.prototype.onMouseup = function(e) {

    e.preventDefault();
    e.stopPropagation()

    $(window).off('mouseup.backsplash');
    $(window).off('mousemove.backsplash');

    this.resetTiles();

    return false;
}


return Editor;

})();
