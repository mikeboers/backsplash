
Mosaic = require('./mosaic').Mosaic


m = new Mosaic(parseInt(process.argv[2], 10))

for (i = 3; i < process.argv.length; i += 5) {

    label = process.argv[i]
    row = parseInt(process.argv[i + 1], 10)
    col = parseInt(process.argv[i + 2], 10)
    height = parseInt(process.argv[i + 3], 10)
    width = parseInt(process.argv[i + 4], 10)

    tile = {label:label, row: row, col: col, height: height, width: width}
    m.add(tile)

}

process.stdout.write("order: ");
linear = m.linearize()
for (i = 0; i < linear.length; i++) {
    process.stdout.write(linear[i].label);
}
process.stdout.write("\n\n");

for (row = 0; row < m.tiles.length; row++) {
    for (col = 0; col < m.width; col++) {
        tile = m.tiles[row][col];
        process.stdout.write(tile ? tile.label : " ");
    }
    process.stdout.write("\n");
}

