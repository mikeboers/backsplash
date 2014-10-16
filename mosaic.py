
class Tile(object):
    
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.row = None
        self.col = None


class Mosaic(object):

    def __init__(self, width):
        self.width = width
        self.tiles = []
        self.holes = []

    def append(self, w, h):
        tile = Tile(w, h)
        self.find_hole(tile)
        self.occupy(tile)
        self.tiles.append(tile)
        return tile

    def find_hole(self, tile):
        for r in xrange(len(self.holes)):
            for c in xrange(self.width):
                if self.holes[r] and self.holes[r][c]:
                    if self.fits_holes(tile, r, c):
                        tile.row = r
                        tile.col = c
                        return tile
        tile.row = len(self.holes)
        tile.col = 0
        return tile

    def fits_holes(self, tile, r, c):
        for R in xrange(r, r + tile.height):
            for C in xrange(c, c + tile.width):
                if C >= self.width:
                    return False
                if R < len(self.holes) and (not self.holes[R] or not self.holes[R][C]):
                    return False
        return True

    def occupy(self, tile):
        while len(self.holes) < tile.row + tile.height:
            self.holes.append([True] * self.width)
        for r in xrange(tile.row, tile.row + tile.height):
            for c in xrange(tile.col, tile.col + tile.width):
                self.holes[r][c] = False
            if not any(self.holes[r]):
                self.holes[r] = False

