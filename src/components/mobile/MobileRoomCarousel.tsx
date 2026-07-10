'use client';

import { Check, ChevronRight } from 'lucide-react';
import type { VisualPlannerRoom } from '@/lib/stores/visual-planner-store';

interface MobileRoomCarouselProps {
  rooms: VisualPlannerRoom[];
  activeRoomId: string | null;
  onSelect: (roomId: string) => void;
}

export function MobileRoomCarousel({ rooms, activeRoomId, onSelect }: MobileRoomCarouselProps) {
  return (
    <div className="mobile-room-carousel" role="tablist" aria-label="Rooms">
      {rooms.map((room, index) => (
        <button type="button" role="tab" aria-selected={activeRoomId === room.id} key={room.id} className={activeRoomId === room.id ? 'is-active' : ''} onClick={() => onSelect(room.id)}>
          <span>{room.completionPct === 100 ? <Check /> : index + 1}</span>
          <div><strong>{room.name}</strong><small>{room.placements.length} devices</small></div>
          <ChevronRight />
        </button>
      ))}
    </div>
  );
}
