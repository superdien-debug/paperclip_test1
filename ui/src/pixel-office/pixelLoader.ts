/**
 * Pixel Loader - Utility to load PNG assets and convert them to SpriteData (hex arrays) in the browser.
 */

import { SpriteData } from './types';

const PNG_ALPHA_THRESHOLD = 10;

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a < PNG_ALPHA_THRESHOLD) return '';
  const rgb = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  if (a >= 255) return rgb;
  return `${rgb}${a.toString(16).padStart(2, '0').toUpperCase()}`;
}

/**
 * Loads an image from a URL and extracts its pixel data as a 2D hex array.
 */
export async function loadImageAsSpriteData(
  url: string,
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0
): Promise<SpriteData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, offsetX, offsetY, width, height, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const sprite: SpriteData = [];

      for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          row.push(rgbaToHex(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]));
        }
        sprite.push(row);
      }
      resolve(sprite);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Loads a character sheet and splits it into directions and frames.
 */
export async function loadCharacterSheet(url: string) {
  const frameW = 16;
  const frameH = 32;
  const framesPerRow = 7;
  const directions = ['down', 'up', 'right'] as const;

  const result: Record<string, SpriteData[]> = {
    down: [],
    up: [],
    right: [],
  };

  for (let d = 0; d < directions.length; d++) {
    const dir = directions[d];
    for (let f = 0; f < framesPerRow; f++) {
      const sprite = await loadImageAsSpriteData(
        url,
        frameW,
        frameH,
        f * frameW,
        d * frameH
      );
      result[dir].push(sprite);
    }
  }

  return result;
}

/**
 * Loads wall tiles from a 4x4 grid PNG.
 */
export async function loadWallTiles(url: string): Promise<SpriteData[]> {
  const pieceW = 16;
  const pieceH = 32;
  const cols = 4;
  const rows = 4;
  const sprites: SpriteData[] = [];

  for (let mask = 0; mask < 16; mask++) {
    const ox = (mask % cols) * pieceW;
    const oy = Math.floor(mask / cols) * pieceH;
    const sprite = await loadImageAsSpriteData(url, pieceW, pieceH, ox, oy);
    sprites.push(sprite);
  }

  return sprites;
}

/**
 * Loads a furniture group from a folder path by reading its manifest.json.
 */
export async function loadFurnitureGroup(folderPath: string) {
  const manifestRes = await fetch(`${folderPath}/manifest.json`);
  const manifest = await manifestRes.json();
  
  const catalog: any[] = [];
  const sprites: Record<string, SpriteData> = {};

  async function processMember(member: any, parentProps: any = {}) {
    if (member.type === 'asset') {
      const fileName = member.file || `${member.id}.png`;
      const sprite = await loadImageAsSpriteData(
        `${folderPath}/${fileName}`,
        member.width,
        member.height
      );
      sprites[member.id] = sprite;
      catalog.push({
        id: member.id,
        label: member.name || `${manifest.name} - ${member.id}`,
        category: manifest.category,
        width: member.width,
        height: member.height,
        footprintW: member.footprintW,
        footprintH: member.footprintH,
        isDesk: manifest.isDesk || false,
        groupId: manifest.id,
        orientation: member.orientation || parentProps.orientation,
        state: member.state || parentProps.state,
        frame: member.frame !== undefined ? member.frame : parentProps.frame,
        animationGroup: member.animationGroup || parentProps.animationGroup || (member.frame !== undefined ? manifest.id : undefined),
        canPlaceOnSurfaces: manifest.canPlaceOnSurfaces,
        canPlaceOnWalls: manifest.canPlaceOnWalls,
        backgroundTiles: manifest.backgroundTiles,
        mirrorSide: member.mirrorSide,
        rotationScheme: manifest.rotationScheme,
      });
    } else if (member.type === 'group') {
      const newProps = {
        ...parentProps,
        orientation: member.orientation || parentProps.orientation,
        state: member.state || parentProps.state,
        animationGroup: member.animationGroup || parentProps.animationGroup,
      };
      if (member.members) {
        for (const m of member.members) {
          await processMember(m, newProps);
        }
      }
    }
  }

  if (manifest.members && manifest.members.length > 0) {
    for (const member of manifest.members) {
      await processMember(member);
    }
  } else if (manifest.type === 'asset' || !manifest.members) {
    // If it's a single asset at root level
    await processMember(manifest);
  }

  return { catalog, sprites };
}
