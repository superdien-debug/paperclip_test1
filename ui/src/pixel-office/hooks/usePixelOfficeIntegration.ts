import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { agentsApi } from '../../api/agents';
import { heartbeatsApi } from '../../api/heartbeats';
import { OfficeState } from '../engine/officeState';
import { CharacterState, Direction, OfficeLayout, SpriteData } from '../types';
import { setCharacterTemplates } from '../sprites/spriteData';
import { setFloorSprites } from '../floorTiles';
import { setWallSprites } from '../wallTiles';
import { buildDynamicCatalog } from '../layout/furnitureCatalog';
import { 
  loadImageAsSpriteData, 
  loadCharacterSheet, 
  loadWallTiles,
  loadFurnitureGroup
} from '../pixelLoader';

import { getLayoutById, ensureCEORoom } from '../layout/layoutStore';

const CHARACTER_SPRITES = ["doraemon", "nobita", "shizuka", "gian", "suneo"];

export function usePixelOfficeIntegration(selectedCompanyId: string, layoutId?: string) {
  const officeStateRef = useRef<OfficeState>(new OfficeState());
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // 1. Fetch data from Paperclip API
  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId),
    queryFn: () => agentsApi.list(selectedCompanyId),
    enabled: !!selectedCompanyId,
  });

  const { data: runs } = useQuery({
    queryKey: queryKeys.heartbeats(selectedCompanyId),
    queryFn: () => heartbeatsApi.list(selectedCompanyId),
    enabled: !!selectedCompanyId,
  });

  // 2. Load Assets once
  useEffect(() => {
    async function loadAllAssets() {
      try {
        // Load Characters
        const charSprites = await Promise.all(
          [0, 1, 2, 3, 4, 5].map(i => 
            loadCharacterSheet(`/pixel-assets/assets/characters/char_${i}.png`)
          )
        ) as any;
        setCharacterTemplates(charSprites);

        // Load Walls
        const wallSets = await Promise.all([
          loadWallTiles('/pixel-assets/assets/walls/wall_0.png'),
        ]);
        setWallSprites(wallSets);

        // Load Floors
        const floorSprites = await Promise.all(
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => 
            loadImageAsSpriteData(`/pixel-assets/assets/floors/floor_${i}.png`, 16, 16)
          )
        );
        setFloorSprites(floorSprites);

        // Load Furniture
        const furnitureFolders = [
          'BIN', 'BOOKSHELF', 'CACTUS', 'CLOCK', 'COFFEE', 'COFFEE_TABLE', 
          'CUSHIONED_BENCH', 'CUSHIONED_CHAIR', 'DESK', 'DOUBLE_BOOKSHELF', 
          'HANGING_PLANT', 'LARGE_PAINTING', 'LARGE_PLANT', 'PC', 'PLANT', 
          'PLANT_2', 'POT', 'SMALL_PAINTING', 'SMALL_PAINTING_2', 'SMALL_TABLE', 
          'SOFA', 'TABLE_FRONT', 'WHITEBOARD', 'WOODEN_BENCH', 'WOODEN_CHAIR'
        ];

        const furnitureAssets = await Promise.all(
          furnitureFolders.map(folder => 
            loadFurnitureGroup(`/pixel-assets/assets/furniture/${folder}`)
          )
        );

        const fullCatalog: any[] = [];
        const fullSprites: Record<string, SpriteData> = {};
        
        furnitureAssets.forEach(asset => {
          fullCatalog.push(...asset.catalog);
          Object.assign(fullSprites, asset.sprites);
        });

        buildDynamicCatalog({ catalog: fullCatalog, sprites: fullSprites });

        // Load layout
        const defaultLayoutUrl = '/pixel-assets/assets/interconnected-layout.json';
        await ensureCEORoom(defaultLayoutUrl);

        const targetId = layoutId || 'ceo_room';
        const entry = getLayoutById(targetId);
        
        if (entry) {
          officeStateRef.current.rebuildFromLayout(entry.layout);
        } else {
          // Fallback to fetch if not in store (or just use CEO Room)
          const layoutRes = await fetch(defaultLayoutUrl);
          const layout = await layoutRes.json();
          if (layout) {
            officeStateRef.current.rebuildFromLayout(layout);
          }
        }
        
        setAssetsLoaded(true);
      } catch (err) {
        console.error('Failed to load pixel assets:', err);
      }
    }
    loadAllAssets();
  }, []);

  // 3. Sync Agents to OfficeState
  useEffect(() => {
    if (!assetsLoaded || !agents) return;

    const os = officeStateRef.current;
    
    // Filter agents if this is a special room
    let filteredAgents = agents;
    if (layoutId === 'ceo_room' || (!layoutId && os.characters.size === 0)) {
      // Assuming "CEO" is in the name or role. Adjust based on actual Paperclip data structure
      filteredAgents = agents.filter(a => 
        a.name.toLowerCase().includes('ceo') || 
        (a as any).role?.toLowerCase().includes('ceo') ||
        (a as any).title?.toLowerCase().includes('ceo')
      );
    }

    const currentAgentIds = new Set(filteredAgents.map(a => a.id));

    // Remove agents that are no longer present
    for (const [id] of os.characters) {
      if (!currentAgentIds.has(id.toString())) {
        os.removeAgent(id);
      }
    }

    // Add or update agents
    filteredAgents.forEach((agent, index) => {
      const idNum = parseInt(agent.id.replace(/[^0-9]/g, '')) || index;
      const role = (agent as any).role || (agent as any).title || (agent.name.toLowerCase().includes('ceo') ? 'CEO' : '');

      if (!os.characters.has(idNum)) {
        // Find a seat for the agent
        os.addAgent(idNum, index % 6, 0, undefined, true, undefined, role);
      }

      const char = os.characters.get(idNum);
      if (char) {
        char.role = role;
        // Update activity status based on heartbeats
        const isLive = runs?.some(r => r.agentId === agent.id && (r.status === "running" || r.status === "queued"));
        char.isActive = !!isLive;
        
        // Map Paperclip status to typing/idle
        if (isLive) {
          char.state = CharacterState.TYPE;
          char.currentTool = 'thinking';
        } else {
          char.state = CharacterState.IDLE;
          char.currentTool = null;
        }
      }
    });
  }, [agents, runs, assetsLoaded]);

  const saveLayout = async (layout: OfficeLayout) => {
    // For now, save to local storage or console
    console.log('Saving layout:', layout);
    localStorage.setItem(`pixel_office_layout_${selectedCompanyId}_${layoutId || 'default'}`, JSON.stringify(layout));
  };

  return {
    officeState: officeStateRef.current,
    assetsLoaded,
    error: null,
    saveLayout
  };
}
