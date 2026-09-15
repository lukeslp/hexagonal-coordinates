# hexagonal-coordinates

Geometry for pointy-top hex grids: convert screen positions to cells, find
neighbors, measure distance, select rings, and draw SVG hexagons. Written in
TypeScript, with no runtime dependencies.

## Install from source

Use Node.js 18 or later to build and run the tests:

```bash
git clone https://github.com/lukeslp/hexagonal-coordinates.git
cd hexagonal-coordinates
npm ci
npm test
npm pack
```

From your consuming project, install the generated archive (replace the path
with your checkout's location):

```bash
npm install /path/to/hexagonal-coordinates/hexagonal-coordinates-1.0.0.tgz
```

`npm pack` builds the library and creates an archive locally. These instructions
use that archive; they do not require an npm registry release. The package
provides ES modules, TypeScript declarations, and source maps.

## Quick Start

```typescript
import {
  hexToPixel,
  pixelToHex,
  hexRound,
  hexDistance,
  hexNeighbors,
  hexagonPath,
  type HexCoord,
} from 'hexagonal-coordinates';

// Convert hex to pixel for rendering
const pixel = hexToPixel(2, -1);
console.log(pixel); // approximately { x: 207.85, y: -120 }

// Convert click position to hex
const fractional = pixelToHex(200, -100);
const hex = hexRound(fractional.q, fractional.r);

// Calculate distance
const dist = hexDistance({ q: 0, r: 0 }, { q: 3, r: -2 });
console.log(dist); // 3

// Get neighbors
const neighbors = hexNeighbors(0, 0);
console.log(neighbors.length); // 6

// Generate SVG path
const path = hexagonPath();
// Use in: <path d={path} transform={`translate(${x}, ${y})`} />
```

## API Reference

### Types

```typescript
interface HexCoord {
  q: number;  // column
  r: number;  // row
}

interface PixelCoord {
  x: number;
  y: number;
}
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `HEX_SIZE` | 80 | Default hex size (center to corner) |
| `HEX_WIDTH` | ~138.6 | Width of default hex |
| `HEX_HEIGHT` | 160 | Height of default hex |
| `HEX_DIRECTIONS` | Array[6] | Direction vectors |

### Coordinate Functions

| Function | Description |
|----------|-------------|
| `hexToPixel(q, r, size?)` | Convert hex to pixel coordinates |
| `pixelToHex(x, y, size?)` | Convert pixel to hex (fractional) |
| `getHexDimensions(size?)` | Hex size, width, and height |
| `hexRound(q, r)` | Round fractional hex to integer |
| `hexKey(q, r)` | Create string key "q,r" |
| `parseHexKey(key)` | Parse "q,r" back to HexCoord |

### Distance & Neighbors

| Function | Description |
|----------|-------------|
| `hexDistance(a, b)` | Distance in hex steps |
| `hexNeighbors(q, r)` | All 6 neighbors |
| `hexNeighbor(q, r, dir)` | Neighbor in direction (0-5) |

### Area Queries

| Function | Description |
|----------|-------------|
| `hexesInRadius(center, r)` | Filled circle of hexes |
| `hexRing(center, r)` | Ring at distance r |
| `hexLine(a, b)` | Line between two hexes |

### Rendering

| Function | Description |
|----------|-------------|
| `hexagonPath(size?)` | SVG path data string |
| `hexagonPoints(size?)` | SVG polygon points |

### Math Utilities

| Function | Description |
|----------|-------------|
| `hexEquals(a, b)` | Check equality |
| `hexAdd(a, b)` | Add coordinates |
| `hexSubtract(a, b)` | Subtract coordinates |
| `hexScale(hex, factor)` | Scale coordinates |

## Coordinate System

This library uses **axial coordinates** with **pointy-top** orientation:

```
       ___
      /   \
  ___/ 0,-1\___
 /   \     /   \
/-1,0 \___/ 1,-1\
\     /   \     /
 \___/ 0,0 \___/
 /   \     /   \
/-1,1 \___/ 1,0 \
\     /   \     /
 \___/ 0,1 \___/
     \     /
      \___/
```

**Direction indices:**

- 0: East (+q)
- 1: Northeast (+q, -r)
- 2: Northwest (-r)
- 3: West (-q)
- 4: Southwest (-q, +r)
- 5: Southeast (+r)

## Examples

### React Component

```tsx
import { hexToPixel, hexagonPath, hexesInRadius } from 'hexagonal-coordinates';

function HexGrid({ radius = 3 }) {
  const hexes = hexesInRadius({ q: 0, r: 0 }, radius);

  return (
    <svg viewBox="-400 -400 800 800">
      {hexes.map(({ q, r }) => {
        const { x, y } = hexToPixel(q, r);
        return (
          <path
            key={`${q},${r}`}
            d={hexagonPath()}
            transform={`translate(${x}, ${y})`}
            fill="none"
            stroke="black"
          />
        );
      })}
    </svg>
  );
}
```

### Click Detection

```typescript
import { pixelToHex, hexRound } from 'hexagonal-coordinates';

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - canvas.width / 2;
  const y = e.clientY - rect.top - canvas.height / 2;

  const fractional = pixelToHex(x, y);
  const clicked = hexRound(fractional.q, fractional.r);

  console.log('Clicked hex:', clicked);
});
```

### Checking a straight line

```typescript
import { hexLine, type HexCoord } from 'hexagonal-coordinates';

function canSee(from: HexCoord, to: HexCoord, blocked: Set<string>): boolean {
  const line = hexLine(from, to);
  return !line.some(hex => blocked.has(`${hex.q},${hex.r}`));
}
```

`hexLine` samples one cell per step along a straight segment. It does not search
around obstacles. A segment exactly on a cell boundary selects one side rather
than every cell it touches. Use a separate visibility or pathfinding algorithm
when those rules matter.

## Input conventions

Use finite integer axial coordinates for cells, integer direction indices from
0 through 5, and nonnegative integer radii. Pixel positions may be fractional;
hex sizes must be finite and positive. The functions assume valid inputs rather
than validating them. `parseHexKey` expects a key produced by `hexKey`.

Pixel coordinates have their origin at the center of cell `(0, 0)`, with positive
Y downward. The click example assumes the canvas backing dimensions match its
displayed dimensions; account for CSS scaling and any camera transform before
converting a pointer position.

## Custom Hex Size

All rendering functions accept an optional `size` parameter:

```typescript
const smallPath = hexagonPath(40);  // 40px hex
const pixel = hexToPixel(1, 0, 40); // Using 40px size
```

## Development

```bash
npm ci
npm run check
npm test
```

The tests cover coordinate round trips, nearest-cell rounding, shortest-path
distance, neighbor symmetry, ring and disk membership, contiguous lines, and SVG
geometry. `npm test` builds first. The tests use Node's built-in test runner.

The build, tests, and local archive installation were verified with Node.js
26.5.1 and TypeScript 5.9.3. Node.js 18 is the recommended minimum for the test
runner; it was not tested in that verification pass.

## License

[MIT](LICENSE), copyright Luke Steuber.

## Credits

- Algorithm reference: [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/)
- Author: Luke Steuber ([@lukesteuber](https://bsky.app/profile/lukesteuber.com))
