import random
import re
import string
import subprocess
import unittest
from textwrap import dedent

from mosaic import Mosaic, Tile


def format_labels_py(width, tiles):

    m = Mosaic(width)
    for t in tiles:
        m.add(t)

    lines = []

    lines.append('order: ' + ''.join(t.label for t in m.linearize()))
    lines.append('')

    for r in xrange(len(m._holes)):
        labels = []
        for c in xrange(m._width):
            t = m._tiles.get((r, c))
            labels.append(t.label if t else ' ')
        lines.append(''.join(labels))
    return '\n'.join(lines)


def format_labels_js(width, tiles):

    cmd = ['node', 'test_mosaic.js', width]
    for tile in tiles:
        cmd.extend((tile.label, tile.row or 0, tile.col or 0, tile.height, tile.width))
    cmd = map(str, cmd)

    out = subprocess.check_output(cmd)
    out = re.sub(r'\n\s+$', '', out)
    return out


class TestCase(unittest.TestCase):

    def assertEqualLayout(self, width, tiles, manual=None):
        js = format_labels_js(width, tiles)
        py = format_labels_py(width, tiles)
        print py
        if manual:
            self.assertEqualLines(py, manual)
        self.assertEqualLines(py, js)

    def assertEqualLines(self, a, b, *args):
        a = dedent(a).strip().splitlines()
        a = [x.rstrip() for x in a]
        b = dedent(b).strip().splitlines()
        b = [x.rstrip() for x in b]
        self.assertEqual(a, b, *args) 


class TestMosaic(TestCase):

    def test_basic_layouts(self):
        self.assertEqualLayout(5, [
            Tile(2, 2, label='A'),
            Tile(2, 2, label='B'),
            Tile(2, 2, label='C'),
            Tile(1, 1, label='D'),
        ], '''
            order: ABDC

            AABBD
            AABB
            CC
            CC

        ''')

    def test_leaving_gaps(self):
        self.assertEqualLayout(5, [
            Tile(2, 2, label='A'),
            Tile(1, 4, label='B'),
            Tile(3, 1, label='C'),
        ], '''
            order: ACB

            AA  C
            AA  C
            BBBBC

        ''')

    def test_random_layouts(self):
        for width in xrange(5, 11):
            for max_size in xrange(2, width + 1):
                tiles = []
                for _ in xrange(random.randrange(width, width * 2)):
                    tiles.append(Tile(
                        random.randrange(1, max_size + 1),
                        random.randrange(1, max_size + 1),
                        label=string.printable[len(tiles)]
                    ))
                self.assertEqualLayout(width, tiles)


