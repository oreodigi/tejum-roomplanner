import type { DevicePlacement } from '@/lib/types';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';

export interface RoomSetupProps {
  room: VisualPlannerRoom;
  selectedDeviceKey: string | null;
  selectedPlacementId: string | null;
  showCeiling: boolean;
  onSelectDevice: (deviceKey: string | null) => void;
  onSelectPlacement: (placementId: string | null) => void;
  onPlace: (position: DevicePlacement['position'], wallId?: string | null) => void;
  onUpdatePlacement: (placementId: string, updates: Partial<DevicePlacement>) => void;
  onDeletePlacement: (placementId: string) => void;
  onToggleCeiling: () => void;
  onApplyRecommended: () => void;
  onUpdateDimensions: (dimensions: { width_m?: number; length_m?: number; height_m?: number }) => void;
}
