import assert from 'node:assert/strict';
import test from 'node:test';
import * as hex from '../dist/index.js';

const key = ({ q, r }) => `${q},${r}`;
const sameCell = (a, b) => assert.equal(key(a), key(b));
const origin = { q: 0, r: 0 };
const cells = [];
for (let q = -4; q <= 4; q++) {
  for (let r = -4; r <= 4; r++) cells.push({ q, r });
}

test('pixel conversions recover cell centers at several sizes', () => {
  for (const size of [0.5, 1, 40, 80, 137]) {
    for (const cell of cells) {
      const pixel = hex.hexToPixel(cell.q, cell.r, size);
      const fractional = hex.pixelToHex(pixel.x, pixel.y, size);
      assert.ok(Math.abs(cell.q - fractional.q) < 1e-10);
      assert.ok(Math.abs(cell.r - fractional.r) < 1e-10);
      sameCell(hex.hexRound(fractional.q, fractional.r), cell);
    }
  }
});

test('rounding chooses a nearest cube-coordinate cell, including near boundaries', () => {
  for (let q = -1.9; q < 2; q += 0.2) {
    for (let r = -1.9; r < 2; r += 0.2) {
      const rounded = hex.hexRound(q, r);
      const squaredDistance = cell => (q - cell.q) ** 2 + (r - cell.r) ** 2 + (q + r - cell.q - cell.r) ** 2;
      const nearest = Math.min(...cells.map(squaredDistance));
      assert.ok(Math.abs(squaredDistance(rounded) - nearest) < 1e-10);
    }
  }
});

test('six unique neighbors are one step away and directions have opposites', () => {
  for (const cell of cells) {
    const neighbors = hex.hexNeighbors(cell.q, cell.r);
    assert.equal(new Set(neighbors.map(key)).size, 6);
    neighbors.forEach((neighbor, direction) => {
      assert.equal(hex.hexDistance(cell, neighbor), 1);
      sameCell(hex.hexNeighbor(cell.q, cell.r, direction), neighbor);
      sameCell(hex.hexNeighbor(neighbor.q, neighbor.r, (direction + 3) % 6), cell);
    });
  }
});

test('distance equals independently explored shortest paths and is symmetric', () => {
  const distances = new Map([[key(origin), 0]]);
  const queue = [origin];
  for (let i = 0; i < queue.length; i++) {
    const cell = queue[i];
    const distance = distances.get(key(cell));
    if (distance === 8) continue;
    for (const neighbor of hex.hexNeighbors(cell.q, cell.r)) {
      if (!distances.has(key(neighbor))) {
        distances.set(key(neighbor), distance + 1);
        queue.push(neighbor);
      }
    }
  }
  for (const cell of cells) {
    assert.equal(hex.hexDistance(origin, cell), distances.get(key(cell)));
    assert.equal(hex.hexDistance(cell, origin), distances.get(key(cell)));
    assert.equal(hex.hexDistance(cell, cell), 0);
  }
});

test('rings are closed adjacent cycles, disks are exactly their union', () => {
  for (const center of [origin, { q: -3, r: 5 }]) {
    const union = new Set();
    for (let radius = 0; radius <= 7; radius++) {
      const ring = hex.hexRing(center, radius);
      assert.equal(ring.length, radius === 0 ? 1 : 6 * radius);
      assert.equal(new Set(ring.map(key)).size, ring.length);
      ring.forEach((cell, i) => {
        assert.equal(hex.hexDistance(center, cell), radius);
        if (radius > 0) assert.equal(hex.hexDistance(cell, ring[(i + 1) % ring.length]), 1);
        union.add(key(cell));
      });
      const disk = hex.hexesInRadius(center, radius);
      assert.equal(disk.length, 1 + 3 * radius * (radius + 1));
      assert.deepEqual(new Set(disk.map(key)), union);
    }
  }
});

test('lines include both endpoints with one adjacent step per unit distance', () => {
  for (const a of cells) {
    for (const b of cells) {
      const line = hex.hexLine(a, b);
      assert.equal(line.length, hex.hexDistance(a, b) + 1);
      sameCell(line[0], a);
      sameCell(line.at(-1), b);
      assert.equal(new Set(line.map(key)).size, line.length);
      for (let i = 1; i < line.length; i++) assert.equal(hex.hexDistance(line[i - 1], line[i]), 1);
    }
  }
});

test('SVG vertices form a pointy-top regular hexagon at the requested size', () => {
  for (const size of [1, 40, 80]) {
    const points = hex.hexagonPoints(size).split(' ').map(pair => pair.split(',').map(Number));
    assert.equal(points.length, 6);
    points.forEach(([x, y], i) => {
      const [nextX, nextY] = points[(i + 1) % points.length];
      assert.ok(Math.abs(Math.hypot(x, y) - size) < 1e-10);
      assert.ok(Math.abs(Math.hypot(x - nextX, y - nextY) - size) < 1e-10);
    });
    assert.equal(hex.hexagonPath(size), `M${points.map(p => p.join(',')).join('L')}Z`);
    const dimensions = hex.getHexDimensions(size);
    assert.ok(Math.abs(Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0])) - dimensions.width) < 1e-10);
    assert.equal(Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1])), dimensions.height);
  }
});

test('coordinate keys and arithmetic round-trip across negative coordinates', () => {
  for (const cell of cells) {
    sameCell(hex.parseHexKey(hex.hexKey(cell.q, cell.r)), cell);
    sameCell(hex.hexSubtract(hex.hexAdd(cell, { q: 7, r: -8 }), { q: 7, r: -8 }), cell);
    assert.ok(hex.hexEquals(hex.hexScale(cell, -1), { q: -cell.q, r: -cell.r }));
  }
});
