import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { usePixelOfficeIntegration } from '../pixel-office/hooks/usePixelOfficeIntegration';
import { OfficeCanvas } from '../pixel-office/components/OfficeCanvas';
import { 
  EditorToolbar,
  useEditorState 
} from '../pixel-office/editor';
import { TileType } from '../pixel-office/types';
import { Button } from '@/components/ui/button';
import { Save, Settings2 } from 'lucide-react';
import { 
  layoutToTileMap,
  getBlockedTiles,
  layoutToSeats
} from '../pixel-office/layout/layoutSerializer';
import {
  moveFurniture,
  removeFurniture,
  rotateFurniture,
} from '../pixel-office/editor/editorActions';

export function Office() {
  const { layoutId } = useParams();
  const { selectedCompany } = useCompany();
  const companyId = selectedCompany?.id || '';
  
  const {
    officeState,
    assetsLoaded,
    error,
    saveLayout,
  } = usePixelOfficeIntegration(companyId, layoutId || 'default_ceo');

  const {
    state: es,
    activeTool,
    selectedTileType,
    selectedFurnitureType,
    selectedFurnitureUid,
    editorTick,
    forceUpdate,
    handleToolChange,
    handleTileTypeChange,
    handleFurnitureTypeChange,
    setSelectedFurnitureUid,
  } = useEditorState();

  const [isEditMode, setIsEditMode] = useState(false);
  const [zoom, setZoom] = useState(2);
  const panRef = useRef({ x: 0, y: 0 });

  const handleSave = async () => {
    try {
      await saveLayout(officeState.getLayout());
      es.isDirty = false;
      forceUpdate();
    } catch (err) {
      console.error('Failed to save layout:', err);
    }
  };

  const onEditorTileAction = (col: number, row: number) => {
    const layout = officeState.getLayout();
    es.pushUndo(layout);
    
    const newTiles = [...layout.tiles];
    newTiles[row * layout.cols + col] = es.selectedTileType;
    
    const newLayout = { ...layout, tiles: newTiles };
    officeState.rebuildFromLayout(newLayout);
    es.isDirty = true;
    forceUpdate();
  };

  const onEditorEraseAction = (col: number, row: number) => {
    const layout = officeState.getLayout();
    es.pushUndo(layout);
    
    const newTiles = [...layout.tiles];
    newTiles[row * layout.cols + col] = TileType.VOID;
    
    const newLayout = { ...layout, tiles: newTiles };
    officeState.rebuildFromLayout(newLayout);
    es.isDirty = true;
    forceUpdate();
  };

  const onDragMove = (uid: string, newCol: number, newRow: number) => {
    const layout = officeState.getLayout();
    es.pushUndo(layout);
    const newLayout = moveFurniture(layout, uid, newCol, newRow);
    officeState.rebuildFromLayout(newLayout);
    es.isDirty = true;
    forceUpdate();
  };

  const onDeleteSelected = () => {
    if (!es.selectedFurnitureUid) return;
    const layout = officeState.getLayout();
    es.pushUndo(layout);
    const newLayout = removeFurniture(layout, es.selectedFurnitureUid);
    officeState.rebuildFromLayout(newLayout);
    es.selectedFurnitureUid = null;
    setSelectedFurnitureUid(null);
    es.isDirty = true;
    forceUpdate();
  };

  const onRotateSelected = () => {
    if (!es.selectedFurnitureUid) return;
    const layout = officeState.getLayout();
    es.pushUndo(layout);
    const newLayout = rotateFurniture(layout, es.selectedFurnitureUid, 'cw');
    officeState.rebuildFromLayout(newLayout);
    es.isDirty = true;
    forceUpdate();
  };

  if (!assetsLoaded) {
    return <div className="flex h-full items-center justify-center">Loading Office assets...</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-2 bg-card/50">
          <h1 className="text-lg font-semibold capitalize tracking-tight">
            {layoutId?.replace('_', ' ') || 'CEO Room'}
          </h1>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!es.isDirty}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            )}
            <Button variant={isEditMode ? "secondary" : "outline"} size="sm" onClick={() => setIsEditMode(!isEditMode)}>
              <Settings2 className="mr-2 h-4 w-4" /> {isEditMode ? "Exit Designer" : "Design Office"}
            </Button>
          </div>
        </div>
        
        <div className="relative flex-1 overflow-hidden">
          <OfficeCanvas
            officeState={officeState}
            isEditMode={isEditMode}
            editorState={es}
            editorTick={editorTick}
            zoom={zoom}
            panRef={panRef}
            onZoomChange={setZoom}
            onClick={(id) => console.log('Clicked agent:', id)}
            onEditorTileAction={onEditorTileAction}
            onEditorEraseAction={onEditorEraseAction}
            onDeleteSelected={onDeleteSelected}
            onRotateSelected={onRotateSelected}
            onDragMove={onDragMove}
            onEditorSelectionChange={() => setSelectedFurnitureUid(es.selectedFurnitureUid)}
          />
          
          {isEditMode && (
            <EditorToolbar
              activeTool={activeTool}
              selectedTileType={selectedTileType}
              selectedFurnitureType={selectedFurnitureType}
              selectedFurnitureUid={selectedFurnitureUid}
              selectedFurnitureColor={es.selectedFurnitureUid ? officeState.getLayout().furniture.find(f => f.uid === es.selectedFurnitureUid)?.color || null : es.pickedFurnitureColor}
              floorColor={es.floorColor}
              wallColor={es.wallColor}
              selectedWallSet={es.selectedWallSet}
              onToolChange={handleToolChange}
              onTileTypeChange={handleTileTypeChange}
              onFurnitureTypeChange={handleFurnitureTypeChange}
              onFloorColorChange={(c) => { es.floorColor = c; forceUpdate(); }}
              onWallColorChange={(c) => { es.wallColor = c; forceUpdate(); }}
              onWallSetChange={(s) => { es.selectedWallSet = s; forceUpdate(); }}
              onSelectedFurnitureColorChange={(color) => {
                if (es.selectedFurnitureUid) {
                  // Update existing furniture color
                  const layout = officeState.getLayout();
                  es.pushUndo(layout);
                  const furniture = layout.furniture.map(f => 
                    f.uid === es.selectedFurnitureUid ? { ...f, color: color || undefined } : f
                  );
                  const newLayout = { ...layout, furniture };
                  officeState.rebuildFromLayout(newLayout);
                  es.isDirty = true;
                } else {
                  // Set color for next placement
                  es.pickedFurnitureColor = color;
                }
                forceUpdate();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
