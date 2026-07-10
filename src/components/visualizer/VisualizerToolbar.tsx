'use client';

import { Box, Eye, EyeOff, Rotate3D } from 'lucide-react';

interface VisualizerToolbarProps {
  showCeiling: boolean;
  topView: boolean;
  onToggleCeiling: () => void;
  onToggleView: () => void;
}

export function VisualizerToolbar({ showCeiling, topView, onToggleCeiling, onToggleView }: VisualizerToolbarProps) {
  return (
    <div className="visualizer-toolbar">
      <button type="button" onClick={onToggleView} aria-pressed={topView}>
        {topView ? <Rotate3D /> : <Box />}<span>{topView ? 'Perspective' : 'Top view'}</span>
      </button>
      <button type="button" onClick={onToggleCeiling} aria-pressed={showCeiling}>
        {showCeiling ? <EyeOff /> : <Eye />}<span>{showCeiling ? 'Hide ceiling' : 'Show ceiling'}</span>
      </button>
    </div>
  );
}
