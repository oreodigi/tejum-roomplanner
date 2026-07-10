import type { PropertyType, RoomType } from '@/lib/types';
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
  const minimumFloors = propertyType === '3storey_villa' ? 3 : propertyType === '2storey_villa' || propertyType === 'duplex' ? 2 : 1;
  return generateBasicRooms(
    Math.max(minimumFloors, numFloors, 1),
    Math.max(0, numBedrooms),
    Math.max(0, numBathrooms),
    Math.max(0, numBalconies),
    Math.max(1, numKitchens),
    Math.max(0, numParking),
    Math.max(0, numOutdoor),
    propertyType,
  );
}

function generateBasicRooms(
  numFloors: number,
  numBedrooms: number,
  numBathrooms: number,
  numBalconies: number,
  numKitchens: number,
  numParking: number,
  numOutdoor: number,
  propertyType: PropertyType,
): GeneratedFloor[] {
  const floors: GeneratedFloor[] = Array.from({ length: numFloors }, (_, floorNumber) => ({
    name: FLOOR_NAMES[floorNumber] || `Floor ${floorNumber}`,
    floor_number: floorNumber,
    rooms: [],
  }));
  let sortOrder = 0;

  const addRoom = (floorNumber: number, name: string, roomType: RoomType) => {
    const floor = floors[Math.min(Math.max(floorNumber, 0), floors.length - 1)];
    floor.rooms.push({
      name,
      room_type: roomType,
      floor_number: floor.floor_number,
      floor_name: floor.name,
      sort_order: sortOrder++,
    });
  };

  addRoom(0, 'Entrance', 'entrance');
  addRoom(0, propertyType === 'studio_apartment' ? 'Studio Living' : 'Living Room', 'living_room');
  if (propertyType !== 'studio_apartment') addRoom(0, 'Dining', 'dining_room');
  for (let index = 1; index <= numKitchens; index++) addRoom(0, index === 1 ? 'Kitchen' : `Kitchen ${index}`, 'kitchen');

  const bedroomFloorStart = numFloors > 1 ? 1 : 0;
  for (let index = 1; index <= numBedrooms; index++) {
    const floorNumber = bedroomFloorStart + ((index - 1) % Math.max(1, numFloors - bedroomFloorStart));
    addRoom(floorNumber, index === 1 ? 'Master Bedroom' : `Bedroom ${index}`, index === 1 ? 'master_bedroom' : 'bedroom');
  }

  for (let index = 1; index <= numBathrooms; index++) {
    const floorNumber = numBedrooms > 0
      ? bedroomFloorStart + ((index - 1) % Math.max(1, numFloors - bedroomFloorStart))
      : 0;
    addRoom(floorNumber, index === 1 && numBedrooms > 0 ? 'Master Bathroom' : `Bathroom ${index}`, index === 1 && numBedrooms > 0 ? 'master_bathroom' : 'bathroom');
  }

  for (let index = 1; index <= numBalconies; index++) {
    const floorNumber = numFloors > 1 ? Math.min(index, numFloors - 1) : 0;
    addRoom(floorNumber, index === 1 ? 'Balcony' : `Balcony ${index}`, 'balcony');
  }

  addRoom(0, 'Utility', 'utility');
  for (let floorNumber = 0; floorNumber < numFloors; floorNumber++) {
    addRoom(floorNumber, floorNumber === 0 ? 'Passage' : `Floor ${floorNumber} Passage`, 'passage');
    if (numFloors > 1 && floorNumber < numFloors - 1) addRoom(floorNumber, 'Staircase', 'staircase');
  }
  for (let index = 1; index <= numParking; index++) addRoom(0, index === 1 ? 'Parking' : `Parking ${index}`, 'parking');
  for (let index = 1; index <= numOutdoor; index++) addRoom(0, index === 1 ? 'Outdoor Area' : `Outdoor Area ${index}`, 'outdoor');

  return floors;
}
