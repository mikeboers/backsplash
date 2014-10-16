
class Tile(object):
    
    def __init__(self, height, width, row=None, col=None, **kw):
        self.width = width
        self.height = height
        self.row = row
        self.col = col
        self.__dict__.update(kw)

    def copy(self):
        return self.__class__(**self.__dict__)


class Mosaic(object):

    def __init__(self, width):
        self._width = width
        self._holes = []
        self._tiles = {}

    @property
    def width(self):
        return self._width

    @property
    def height(self):
        return len(self._holes)

    def add(self, tile=None, **kw):
        tile = tile.copy() or Tile(**kw)
        if not (tile.row and tile.col):
            self._find_hole(tile)
        self._occupy(tile)
        return tile

    def linearize(self):
        seen = set()
        for r in xrange(len(self._holes)):
            for c in xrange(self._width):
                t = self._tiles.get((r, c))
                if not t:
                    continue
                if t not in seen:
                    yield t
                    seen.add(t)

    def _find_hole(self, tile):
        for r in xrange(len(self._holes)):
            for c in xrange(self._width):
                if self._holes[r] and self._holes[r][c]:
                    if self._fits_holes(tile, r, c):
                        tile.row = r
                        tile.col = c
                        return tile
        tile.row = len(self._holes)
        tile.col = 0
        return tile

    def _fits_holes(self, tile, r, c):
        for R in xrange(r, r + tile.height):
            for C in xrange(c, c + tile.width):
                if C >= self._width:
                    return False
                if R < len(self._holes) and (not self._holes[R] or not self._holes[R][C]):
                    return False
        return True

    def _occupy(self, tile):
        while len(self._holes) < tile.row + tile.height:
            self._holes.append([True] * self._width)
        for r in xrange(tile.row, tile.row + tile.height):
            for c in xrange(tile.col, tile.col + tile.width):
                self._holes[r][c] = False
                self._tiles[(r,c)] = tile
            if not any(self._holes[r]):
                self._holes[r] = False

