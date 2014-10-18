backsplash.Editor = (function(){

var clone = backsplash._clone;


jQuery.fn.backsplash = function(cmd, opts) {

    var res = [];
    var cmd_is_string = typeof(cmd) === "string";

    this.each(function() {
        if (cmd_is_string) {
            var editor = $(this).data('backsplash-editor');
            res.push(editor[cmd + "Method"].call(editor, opts))
        } else {
            var editor = new Editor(this, cmd, opts);
            $(this).data('backsplash-editor', editor);
        }
    })

    return cmd_is_string ? res[0] : this;

}


var Editor = function(elem, opts) {

    var editor = this;

    this.$elem = $(elem);
    this.opts = $.extend({}, this.$elem.data('backsplash'), opts);

    this.selection = []

    $(window).on('keydown.backsplash', $.proxy(this, 'onKeydown'));

    this.tiles = [];
    this.$elem.children().each(function() {

        var $tile = $(this);

        $tile.addClass('backsplash-tile');

        var tile = $tile.data('tile') || {};
        $tile.data('tile', tile);

        tile.$elem = $tile;
        tile.$controls = $('<div class="backsplash-controls btn-group btn-group-xs" />')
            .appendTo($tile);

        tile.selected = false;
        tile.$selected = $('<a href="#" class="btn"><span class="fa fa-arrows"></span></a>')
            .on('click.backsplash', function(e) { e.preventDefault() })
            .on('mousedown.backsplash', $.proxy(editor, 'onMousedown'))
            .appendTo(tile.$controls);

        tile.pinned = false;
        tile.$pinned = $('<a href="#" class="btn"><span class="fa fa-thumb-tack"></span></a>')
            .on('click.backsplash', $.proxy(editor, 'clickPinned'))
            .appendTo(tile.$controls);

        tile.locked = false;
        tile.$locked = $('<a href="#" class="btn"><span class="fa fa-unlock"></span></a>')
            .on('click.backsplash', $.proxy(editor, 'clickLocked'))
            .appendTo(tile.$controls);

        editor.updateButtons(tile);

        editor.tiles.push(tile);
    })

}


Editor.prototype.clickPinned = function(e) {
    e.preventDefault();
    var tile = $(e.target).closest('.backsplash-tile').data('tile')
    tile.pinned = !tile.pinned;
    this.updateButtons(tile);
    if (!(tile.pinned || tile.locked)) {
        this.restoreBackup(tile, tile.backup);
        this.resetTiles();
    }
}

Editor.prototype.clickLocked = function(e) {
    e.preventDefault();
    var tile = $(e.target).closest('.backsplash-tile').data('tile')
    tile.locked = !tile.locked;
    this.updateButtons(tile);
    if (!(tile.pinned || tile.locked)) {
        this.restoreBackup(tile, tile.backup);
        this.resetTiles();
    }
}


Editor.prototype.updateButtons = function(tile) {

    if (tile.selected) {
        tile.$selected.addClass('active').removeClass('btn-default').addClass('btn-primary')
    } else {
        tile.$selected.removeClass('active').addClass('btn-default').removeClass('btn-primary')
    }

    if (tile.pinned) {
        tile.$pinned.addClass('active').removeClass('btn-default').addClass('btn-warning')
    } else {
        tile.$pinned.removeClass('active').addClass('btn-default').removeClass('btn-warning')
    }

    if (tile.locked) {
        tile.$locked.addClass('active').removeClass('btn-default').addClass('btn-danger')
            .find('span').removeClass('fa-unlock').addClass('fa-lock')
    } else {
        tile.$locked.removeClass('active').addClass('btn-default').removeClass('btn-danger')
            .find('span').removeClass('fa-lock').addClass('fa-unlock')
    }

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
        this.tiles[i]._first = !i
        if (this.tiles[i].pinned || this.tiles[i].locked) {
            this.resetTile(layout, this.tiles[i])
        }
    }
    for (var i = 0; i < this.tiles.length; i++) {
        if (!(this.tiles[i].pinned || this.tiles[i].locked)) {
            this.resetTile(layout, this.tiles[i], {ignore_position: true})
        }
    }

    return layout;

}


Editor.prototype.restoreBackups = function() {
    for (var i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].backup) {
            this.restoreBackup(this.tiles[i], this.tiles[i].backup)
        }
    }
    this.resetTiles();
}


Editor.prototype.restoreBackup = function(dst, src) {

    dst.width = src.width
    dst.height = src.height
    dst.row = src.row
    dst.col = src.col
    dst.locked = src.locked
    dst.pinned = false

    this.updateButtons(dst);

    if (dst.row != src.row || dst.col != src.col) {
        dst.$elem.trigger('resized', [dst, this]);
        dst.$elem.trigger('restored', [dst]);
    }

}


Editor.prototype.onKeydown = function(e) {

    switch (e.which) {

        case 114: // r
            this.restoreBackups();
            break;

        case 38: // up
        case 40: // down
            e.preventDefault()
            for (var i = 0; i < this.selection.length; i++) {
                var tile = this.selection[i];
                if (e.metaKey) {
                    tile.height += e.which == 40 ? 1 : -1;
                    tile.$elem.trigger('resized', [tile, this])
                } else {
                    tile.row += e.which == 40 ? 1 : -1;
                    tile.$elem.trigger('moved', [tile])
                }
            }
            this.resetTiles();
            break;

        case 37: // left
        case 39: // right
            e.preventDefault()
            for (var i = 0; i < this.selection.length; i++) {
                var tile = this.selection[i];
                if (e.metaKey) {
                    tile.width += e.which == 39 ? 1 : -1;
                    tile.$elem.trigger('resized', [tile, this])
                } else {
                    tile.col += e.which == 39 ? 1 : -1;
                    tile.$elem.trigger('moved', [tile])
                }
            }
            this.resetTiles();
            break;

        default:
            // console.log('unknown key', e.which, e)
    }

}


Editor.prototype.onMousedown = function(e) {

    e.preventDefault();
    var tile = $(e.target).closest('.backsplash-tile').data('tile')

    this.mousedown = e;
    this.mousedownTile = tile;
    this.mousedownOffset = tile.$elem.offset();
    this.mousedownRow = tile.row;
    this.mousedownCol = tile.col;

    tile.backup = clone(tile.backup || tile)
    tile.pinned = true;

    $(window).on('mouseup.backsplash', $.proxy(this, 'onMouseup'));
    $(window).on('mousemove.backsplash', $.proxy(this, 'onMousemove'));

    if (!e.shiftKey) {
        for (var i = 0; i < this.selection.length; i++) {
            this.selection[i].selected = false;
            this.updateButtons(this.selection[i]);
        }
        this.selection = []
    }
    tile.selected = true;
    this.selection.push(tile);

    this.updateButtons(tile);

    this.resetTiles();

}


Editor.prototype.onMousemove = function(e) {

    e.preventDefault();

    var origin = this.$elem.offset();
    var x = e.pageX - origin.left + this.mousedownOffset.left - this.mousedown.pageX;
    var y = e.pageY - origin.top +this.mousedownOffset.top - this.mousedown.pageY;

    var row = Math.floor(y / (this.opts.tile_size + this.opts.padding) + 0.5);
    var col = Math.floor(x / (this.opts.tile_size + this.opts.padding) + 0.5);

    var tile = this.selection[0];
    var changed = (tile.row != row || tile.col != col);
    tile.row = row;
    tile.col = col;

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

    if (this.mousedownRow != this.mousedownTile.row || this.mousedownCol != this.mousedownTile.col) {
        this.mousedownTile.$elem.trigger('moved', [this.mousedownTile]);
    }

    this.resetTiles();

    return false;
}



Editor.prototype.resetMethod = function() {
    this.restoreBackups();
}

Editor.prototype.commitMethod = function() {
    var layout = this.resetTiles();
    return this.tilesMethod(layout.linearize());
}

Editor.prototype.tilesMethod = function(tiles) {

    if (tiles) {
        this.tiles = tiles;
        for (var i = 0; i < this.tiles.length; i++) {

            var tile = this.tiles[i];
            tile.$elem.data('tile', tile)

            this.selected = false;
            tile.pinned = false;
            tile.backup = null;
            tile.width = tile.width || 1;
            tile.height = tile.height || 1;

            this.updateButtons(tile);
        }
        this.selection = [];
        this.resetTiles();
    }

    return this.tiles;
}


return Editor;

})();
