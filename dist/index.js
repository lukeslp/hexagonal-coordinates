/**
 * Hexagonal Coordinates
 *
 * A complete axial coordinate hexagonal grid system with:
 * - Coordinate conversion (hex ↔ pixel)
 * - Distance calculations
 * - Neighbor finding
 * - Ring and radius queries
 * - Line-of-sight pathfinding
 * - SVG path generation
 *
 * Uses axial coordinates (q, r) with pointy-top orientation.
 * Reference: https://www.redblobgames.com/grids/hexagons/
 *
 * @packageDocumentation
 */
// Default hex size
const DEFAULT_HEX_SIZE = 80;
/**
 * Get hex dimensions based on size
 */
export function getHexDimensions(size = DEFAULT_HEX_SIZE) {
    return {
        size,
        width: Math.sqrt(3) * size,
        height: 2 * size,
    };
}
/** Default hex size constant */
export const HEX_SIZE = DEFAULT_HEX_SIZE;
/** Calculated hex width */
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
/** Calculated hex height */
export const HEX_HEIGHT = 2 * HEX_SIZE;
/**
 * The 6 directions in a pointy-top hexagon
 */
export const HEX_DIRECTIONS = [
    { q: 1, r: 0 }, // East
    { q: 1, r: -1 }, // Northeast
    { q: 0, r: -1 }, // Northwest
    { q: -1, r: 0 }, // West
    { q: -1, r: 1 }, // Southwest
    { q: 0, r: 1 }, // Southeast
];
/**
 * Direction names for reference
 */
export const HEX_DIRECTION_NAMES = [
    'East',
    'Northeast',
    'Northwest',
    'West',
    'Southwest',
    'Southeast',
];
/**
 * Convert axial hex coordinates to pixel coordinates
 * Uses pointy-top orientation
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @param size - Hex size (default: 80)
 * @returns Pixel coordinates {x, y}
 *
 * @example
 * ```ts
 * const pixel = hexToPixel(2, -1);
 * console.log(pixel); // { x: 207.85, y: -120 }
 * ```
 */
export function hexToPixel(q, r, size = HEX_SIZE) {
    const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = size * ((3 / 2) * r);
    return { x, y };
}
/**
 * Convert pixel coordinates to axial hex coordinates
 * Returns fractional coordinates (use hexRound for integer)
 *
 * @param x - Pixel x coordinate
 * @param y - Pixel y coordinate
 * @param size - Hex size (default: 80)
 * @returns Fractional hex coordinates
 *
 * @example
 * ```ts
 * const hex = pixelToHex(200, -100);
 * const rounded = hexRound(hex.q, hex.r);
 * ```
 */
export function pixelToHex(x, y, size = HEX_SIZE) {
    const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
    const r = ((2 / 3) * y) / size;
    return { q, r };
}
/**
 * Round fractional hex coordinates to nearest integer hex
 * Uses cube coordinate rounding for accuracy
 *
 * @param q - Fractional column coordinate
 * @param r - Fractional row coordinate
 * @returns Integer hex coordinates
 */
export function hexRound(q, r) {
    // Convert to cube coordinates for rounding
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);
    // Reset the component with largest diff
    if (qDiff > rDiff && qDiff > sDiff) {
        rq = -rr - rs;
    }
    else if (rDiff > sDiff) {
        rr = -rq - rs;
    }
    return { q: rq, r: rr };
}
/**
 * Calculate distance between two hexes
 *
 * @param a - First hex coordinate
 * @param b - Second hex coordinate
 * @returns Integer distance in hex steps
 *
 * @example
 * ```ts
 * const dist = hexDistance({ q: 0, r: 0 }, { q: 3, r: -2 });
 * console.log(dist); // 3
 * ```
 */
export function hexDistance(a, b) {
    return (Math.abs(a.q - b.q) +
        Math.abs(a.q + a.r - b.q - b.r) +
        Math.abs(a.r - b.r)) / 2;
}
/**
 * Get all 6 neighbors of a hex
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @returns Array of 6 neighboring hex coordinates
 */
export function hexNeighbors(q, r) {
    return HEX_DIRECTIONS.map(dir => ({
        q: q + dir.q,
        r: r + dir.r,
    }));
}
/**
 * Get neighbor in a specific direction
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @param direction - Direction index (0-5)
 * @returns Neighbor hex coordinate
 */
export function hexNeighbor(q, r, direction) {
    const dir = HEX_DIRECTIONS[direction % 6];
    return { q: q + dir.q, r: r + dir.r };
}
/**
 * Get all hexes within a radius (filled circle)
 *
 * @param center - Center hex coordinate
 * @param radius - Radius in hex steps
 * @returns Array of all hexes within radius (inclusive)
 *
 * @example
 * ```ts
 * const hexes = hexesInRadius({ q: 0, r: 0 }, 2);
 * console.log(hexes.length); // 19 (1 + 6 + 12)
 * ```
 */
export function hexesInRadius(center, radius) {
    const results = [];
    for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
            results.push({
                q: center.q + dq,
                r: center.r + dr,
            });
        }
    }
    return results;
}
/**
 * Get hexes forming a ring at a specific distance
 *
 * @param center - Center hex coordinate
 * @param radius - Ring radius
 * @returns Array of hexes forming the ring
 *
 * @example
 * ```ts
 * const ring = hexRing({ q: 0, r: 0 }, 2);
 * console.log(ring.length); // 12
 * ```
 */
export function hexRing(center, radius) {
    if (radius === 0)
        return [center];
    const results = [];
    let hex = {
        q: center.q + HEX_DIRECTIONS[4].q * radius,
        r: center.r + HEX_DIRECTIONS[4].r * radius,
    };
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            results.push({ ...hex });
            hex = {
                q: hex.q + HEX_DIRECTIONS[i].q,
                r: hex.r + HEX_DIRECTIONS[i].r,
            };
        }
    }
    return results;
}
/**
 * Create a unique string key from hex coordinates
 * Useful for Map/Set keys
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @returns String key "q,r"
 */
export function hexKey(q, r) {
    return `${q},${r}`;
}
/**
 * Parse hex key back to coordinates
 *
 * @param key - String key "q,r"
 * @returns Hex coordinate
 */
export function parseHexKey(key) {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
}
/**
 * Get all hexes along a line between two points
 * Useful for line-of-sight calculations
 *
 * @param a - Start hex
 * @param b - End hex
 * @returns Array of hexes along the line
 */
export function hexLine(a, b) {
    const n = hexDistance(a, b);
    const results = [];
    for (let i = 0; i <= n; i++) {
        const t = n === 0 ? 0 : i / n;
        const q = a.q + (b.q - a.q) * t;
        const r = a.r + (b.r - a.r) * t;
        results.push(hexRound(q, r));
    }
    return results;
}
/**
 * Generate SVG path data for a hexagon centered at origin
 *
 * @param size - Hex size (default: HEX_SIZE)
 * @returns SVG path string
 *
 * @example
 * ```tsx
 * <path d={hexagonPath()} transform={`translate(${x}, ${y})`} />
 * ```
 */
export function hexagonPath(size = HEX_SIZE) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return `M${points.join('L')}Z`;
}
/**
 * Generate SVG polygon points for a hexagon
 *
 * @param size - Hex size (default: HEX_SIZE)
 * @returns Points string for SVG polygon
 *
 * @example
 * ```tsx
 * <polygon points={hexagonPoints()} transform={`translate(${x}, ${y})`} />
 * ```
 */
export function hexagonPoints(size = HEX_SIZE) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}
/**
 * Check if two hex coordinates are equal
 */
export function hexEquals(a, b) {
    return a.q === b.q && a.r === b.r;
}
/**
 * Add two hex coordinates
 */
export function hexAdd(a, b) {
    return { q: a.q + b.q, r: a.r + b.r };
}
/**
 * Subtract two hex coordinates
 */
export function hexSubtract(a, b) {
    return { q: a.q - b.q, r: a.r - b.r };
}
/**
 * Scale a hex coordinate
 */
export function hexScale(hex, factor) {
    return { q: hex.q * factor, r: hex.r * factor };
}
//# sourceMappingURL=index.js.map