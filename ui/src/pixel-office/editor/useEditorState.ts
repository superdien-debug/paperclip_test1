import { useState, useCallback, useMemo, useRef } from 'react';
import { EditorState } from './editorState';
import { EditTool, TileType } from '../types';

export function useEditorState() {
  const [editorTick, setEditorTick] = useState(0);
  const stateRef = useRef<EditorState | null>(null);

  if (!stateRef.current) {
    stateRef.current = new EditorState();
  }

  const es = stateRef.current;

  const forceUpdate = useCallback(() => {
    setEditorTick(t => t + 1);
  }, []);

  const handleToolChange = useCallback((tool: EditTool) => {
    es.activeTool = tool;
    forceUpdate();
  }, [es, forceUpdate]);

  const handleTileTypeChange = useCallback((type: TileType) => {
    es.selectedTileType = type;
    forceUpdate();
  }, [es, forceUpdate]);

  const handleFurnitureTypeChange = useCallback((type: string | null) => {
    es.selectedFurnitureType = type;
    forceUpdate();
  }, [es, forceUpdate]);

  const setSelectedFurnitureUid = useCallback((uid: string | null) => {
    es.selectedFurnitureUid = uid;
    forceUpdate();
  }, [es, forceUpdate]);

  return {
    state: es,
    activeTool: es.activeTool,
    selectedTileType: es.selectedTileType,
    selectedFurnitureType: es.selectedFurnitureType,
    selectedFurnitureUid: es.selectedFurnitureUid,
    editorTick,
    forceUpdate,
    handleToolChange,
    handleTileTypeChange,
    handleFurnitureTypeChange,
    setSelectedFurnitureUid,
  };
}
