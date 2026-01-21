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
/**
 * Hexagonal coordinate in axial system
 */
export interface HexCoord {
    /** Column coordinate */
    q: number;
    /** Row coordinate */
    r: number;
}
/**
 * Pixel coordinate for rendering
 */
export interface PixelCoord {
    x: number;
    y: number;
}
/**
 * Configuration options for hex grid
 */
export interface HexGridConfig {
    /** Size of hexagon (center to corner) */
    size?: number;
}
/**
 * Get hex dimensions based on size
 */
export declare function getHexDimensions(size?: number): {
    size: number;
    width: number;
    height: number;
};
/** Default hex size constant */
export declare const HEX_SIZE = 80;
/** Calculated hex width */
export declare const HEX_WIDTH: number;
/** Calculated hex height */
export declare const HEX_HEIGHT: number;
/**
 * The 6 directions in a pointy-top hexagon
 */
export declare const HEX_DIRECTIONS: readonly HexCoord[];
/**
 * Direction names for reference
 */
export declare const HEX_DIRECTION_NAMES: readonly ["East", "Northeast", "Northwest", "West", "Southwest", "Southeast"];
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
export declare function hexToPixel(q: number, r: number, size?: number): PixelCoord;
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
export declare function pixelToHex(x: number, y: number, size?: number): HexCoord;
/**
 * Round fractional hex coordinates to nearest integer hex
 * Uses cube coordinate rounding for accuracy
 *
 * @param q - Fractional column coordinate
 * @param r - Fractional row coordinate
 * @returns Integer hex coordinates
 */
export declare function hexRound(q: number, r: number): HexCoord;
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
export declare function hexDistance(a: HexCoord, b: HexCoord): number;
/**
 * Get all 6 neighbors of a hex
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @returns Array of 6 neighboring hex coordinates
 */
export declare function hexNeighbors(q: number, r: number): HexCoord[];
/**
 * Get neighbor in a specific direction
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @param direction - Direction index (0-5)
 * @returns Neighbor hex coordinate
 */
export declare function hexNeighbor(q: number, r: number, direction: number): HexCoord;
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
export declare function hexesInRadius(center: HexCoord, radius: number): HexCoord[];
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
export declare function hexRing(center: HexCoord, radius: number): HexCoord[];
/**
 * Create a unique string key from hex coordinates
 * Useful for Map/Set keys
 *
 * @param q - Column coordinate
 * @param r - Row coordinate
 * @returns String key "q,r"
 */
export declare function hexKey(q: number, r: number): string;
/**
 * Parse hex key back to coordinates
 *
 * @param key - String key "q,r"
 * @returns Hex coordinate
 */
export declare function parseHexKey(key: string): HexCoord;
/**
 * Get all hexes along a line between two points
 * Useful for line-of-sight calculations
 *
 * @param a - Start hex
 * @param b - End hex
 * @returns Array of hexes along the line
 */
export declare function hexLine(a: HexCoord, b: HexCoord): HexCoord[];
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
export declare function hexagonPath(size?: number): string;
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
export declare function hexagonPoints(size?: number): string;
/**
 * Check if two hex coordinates are equal
 */
export declare function hexEquals(a: HexCoord, b: HexCoord): boolean;
/**
 * Add two hex coordinates
 */
export declare function hexAdd(a: HexCoord, b: HexCoord): HexCoord;
/**
 * Subtract two hex coordinates
 */
export declare function hexSubtract(a: HexCoord, b: HexCoord): HexCoord;
/**
 * Scale a hex coordinate
 */
export declare function hexScale(hex: HexCoord, factor: number): HexCoord;
//# sourceMappingURL=index.d.ts.map