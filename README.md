# hexagonal-coordinates

A complete axial coordinate hexagonal grid system for games, data visualization, and any application needing hex grids.

**Zero dependencies. TypeScript-first. ~5KB minified.**

## Features

- **Coordinate Conversion**: hex ↔ pixel transformations
- **Distance Calculations**: step-based hex distance
- **Neighbor Finding**: get adjacent hexes in any direction
- **Rings & Radius**: query hexes in circular patterns
- **Line of Sight**: pathfinding between hexes
- **SVG Generation**: ready-to-use path data for rendering

Based on the excellent [Red Blob Games hexagon guide](https://www.redblobgames.com/grids/hexagons/).

## Installation

```bash
npm install hexagonal-coordinates
# or
pnpm add hexagonal-coordinates
# or
yarn add hexagonal-coordinates
```

## Quick Start

```typescript
import {
  hexToPixel,
  pixelToHex,
  hexRound,
  hexDistance,
  hexNeighbors,
  hexagonPath,
  HexCoord,
} from 'hexagonal-coordinates';

// Convert hex to pixel for rendering
const pixel = hexToPixel(2, -1);
console.log(pixel); // { x: 207.85, y: -120 }

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

### Pathfinding

```typescript
import { hexLine, hexDistance } from 'hexagonal-coordinates';

function canSee(from: HexCoord, to: HexCoord, blocked: Set<string>): boolean {
  const line = hexLine(from, to);
  return !line.some(hex => blocked.has(`${hex.q},${hex.r}`));
}
```

## Custom Hex Size

All rendering functions accept an optional `size` parameter:

```typescript
const smallPath = hexagonPath(40);  // 40px hex
const pixel = hexToPixel(1, 0, 40); // Using 40px size
```

## License

MIT

## Credits

- Algorithm reference: [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/)
- Author: Luke Steuber ([@lukesteuber](https://bsky.app/profile/lukesteuber.com))
