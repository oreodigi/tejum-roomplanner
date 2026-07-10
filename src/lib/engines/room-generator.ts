import type { PropertyType, RoomType } from '@/lib/types';
import { PROPERTY_ROOM_TEMPLATES } from '@/lib/constants/property-types';
import { FLOOR_NAMES } from '@/lib/constants/room-types';

// ============================================================
// ROOM AUTO-GENERATION ENGINE
// Generates a recommended room list based on property type,
// floor count, bedroom count, and bathroom count.
// ============================================================

export interface GeneratedRoom {
  name: string;
  room_type: RoomType;
  floor_number: number;
  floor_name: string;
  sort_order: number;
}

export interface GeneratedFloor {
  name: string;
  floor_number: number;
  rooms: GeneratedRoom[];
}

export function generateRoomsForProperty(
  propertyType: PropertyType,
  numFloors: number = 1,
  numBedrooms: number = 0,
  numBathrooms: number = 0,
  numBalconies: number = 0,
  numKitchens: number = 1,
  numParking: number = 0,
  numOutdoor: number = 0
): GeneratedFloor[] {
  // Get template rooms
  const templateKey = propertyType.toString();
  const templateRooms = PROPERTY_ROOM_TEMPLATES[templateKey] || [];

  if (templateRooms.length === 0 && propertyType !== 'custom') {
    // Fallback: generate a basic room set
    return generateBasicRooms(numFloors, numBedrooms, numBathrooms);
  }

  if (propertyType === 'custom') {
    return generateBasicRooms(numFloors, numBedrooms, numBathrooms);
  }

  // Group template rooms by floor
  const floorMap = new Map<number, GeneratedRoom[]>();
  let sortOrder = 0;

  templateRooms.forEach((room) => {
    const floorNum = room.floor;
    if (!floorMap.has(floorNum)) {
      floorMap.set(floorNum, []);
    }
    floorMap.get(floorNum)!.push({
      name: room.name,
      room_type: room.room_type,
      floor_number: floorNum,
      floor_name: FLOOR_NAMES[floorNum] || `Floor ${floorNum}`,
      sort_order: sortOrder++,
    });
  });

  // Convert to array
  const floors: GeneratedFloor[] = [];
  const sortedFloorNums = Array.from(floorMap.keys()).sort((a, b) => a - b);

  for (const floorNum of sortedFloorNums) {
    floors.push({
      name: FLOOR_NAMES[floorNum] || `Floor ${floorNum}`,
      floor_number: floorNum,
      rooms: floorMap.get(floorNum)!,
    });
  }

  return floors;
}

function generateBasicRooms(
  numFloors: number,
  numBedrooms: number,
  numBathrooms: number
): GeneratedFloor[] {
  const floors: GeneratedFloor[] = [];
  let sortOrder = 0;

  // Ground floor: common areas
  const groundRooms: GeneratedRoom[] = [
    { name: 'Entrance', room_type: 'entrance', floor_number: 0, floor_name: 'Ground Floor', sort_order: sortOrder++ },
    { name: 'Living Room', room_type: 'living_room', floor_number: 0, floor_name: 'Ground Floor', sort_order: sortOrder++ },
    { name: 'Kitchen', room_type: 'kitchen', floor_number: 0, floor_name: 'Ground Floor', sort_order: sortOrder++ },
  ];

  if (numFloors === 1) {
    // All rooms on one floor
    for (let i = 1; i <= numBedrooms; i++) {
      groundRooms.push({
        name: i === 1 ? 'Master Bedroom' : `Bedroom ${i}`,
        room_type: i === 1 ? 'master_bedroom' : 'bedroom',
        floor_number: 0,
        floor_name: 'Ground Floor',
        sort_order: sortOrder++,
      });
    }
    for (let i = 1; i <= numBathrooms; i++) {
      groundRooms.push({
        name: i === 1 ? 'Master Bathroom' : `Bathroom ${i}`,
        room_type: i === 1 ? 'master_bathroom' : 'bathroom',
        floor_number: 0,
        floor_name: 'Ground Floor',
        sort_order: sortOrder++,
      });
    }
    groundRooms.push({
      name: 'Balcony',
      room_type: 'balcony',
      floor_number: 0,
      floor_name: 'Ground Floor',
      sort_order: sortOrder++,
    });
    floors.push({ name: 'Ground Floor', floor_number: 0, rooms: groundRooms });
  } else {
    // Multi-floor
    groundRooms.push({
      name: 'Dining Room',
      room_type: 'dining_room',
      floor_number: 0,
      floor_name: 'Ground Floor',
      sort_order: sortOrder++,
    });
    groundRooms.push({
      name: 'Staircase',
      room_type: 'staircase',
      floor_number: 0,
      floor_name: 'Ground Floor',
      sort_order: sortOrder++,
    });
    groundRooms.push({
      name: 'Passage',
      room_type: 'passage',
      floor_number: 0,
      floor_name: 'Ground Floor',
      sort_order: sortOrder++,
    });
    floors.push({ name: 'Ground Floor', floor_number: 0, rooms: groundRooms });

    // Upper floors: bedrooms
    const bedroomsPerFloor = Math.ceil(numBedrooms / (numFloors - 1));
    let bedroomCount = 0;
    let bathroomCount = 0;

    for (let f = 1; f < numFloors; f++) {
      const floorName = FLOOR_NAMES[f] || `Floor ${f}`;
      const floorRooms: GeneratedRoom[] = [];

      const bedsOnThisFloor = Math.min(bedroomsPerFloor, numBedrooms - bedroomCount);
      for (let b = 0; b < bedsOnThisFloor; b++) {
        bedroomCount++;
        floorRooms.push({
          name: bedroomCount === 1 ? 'Master Bedroom' : `Bedroom ${bedroomCount}`,
          room_type: bedroomCount === 1 ? 'master_bedroom' : 'bedroom',
          floor_number: f,
          floor_name: floorName,
          sort_order: sortOrder++,
        });
        // Add matching bathroom
        if (bathroomCount < numBathrooms) {
          bathroomCount++;
          floorRooms.push({
            name: bathroomCount === 1 ? 'Master Bathroom' : `Bathroom ${bathroomCount}`,
            room_type: bathroomCount === 1 ? 'master_bathroom' : 'bathroom',
            floor_number: f,
            floor_name: floorName,
            sort_order: sortOrder++,
          });
        }
      }

      floorRooms.push({
        name: 'Passage',
        room_type: 'passage',
        floor_number: f,
        floor_name: floorName,
        sort_order: sortOrder++,
      });

      if (f < numFloors - 1) {
        floorRooms.push({
          name: 'Staircase',
          room_type: 'staircase',
          floor_number: f,
          floor_name: floorName,
          sort_order: sortOrder++,
        });
      }

      floors.push({ name: floorName, floor_number: f, rooms: floorRooms });
    }
  }

  return floors;
}
