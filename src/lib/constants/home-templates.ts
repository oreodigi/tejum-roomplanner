import type { RoomType } from '@/lib/types';
export interface HomeTemplateRoom{id:string;name:string;roomType:RoomType;x:number;z:number;width:number;length:number;color:string}
export interface HomeTemplate{id:string;name:string;subtitle:string;areaSqFt:number;rooms:HomeTemplateRoom[]}

// Long-form 3BHK derived from the approved architectural reference.
// Entrance is +Z, balcony is -Z. Dimensions are approximate metric equivalents.
export const HOME_TEMPLATES:HomeTemplate[]=[{
 id:'reference-long-3bhk',name:'Signature Long 3BHK',subtitle:'Reference layout · 3 bedrooms · 3 baths · balcony',areaSqFt:1650,
 rooms:[
  {id:'entry',name:'Entry & staircase',roomType:'staircase',x:2.55,z:7.25,width:2.9,length:3.4,color:'#c9b18c'},
  {id:'bedroom-3',name:'Bedroom 3',roomType:'guest_bedroom',x:-2.15,z:6.85,width:4.1,length:4.2,color:'#c8d5df'},
  {id:'passage',name:'Passage',roomType:'passage',x:-.6,z:3.95,width:7.2,length:1.35,color:'#d7cbbd'},
  {id:'living',name:'Drawing room',roomType:'living_room',x:.45,z:1.25,width:7.25,length:4.05,color:'#d8c9b6'},
  {id:'bath-3',name:'Common bath',roomType:'bathroom',x:-3.15,z:1.25,width:1.65,length:3.25,color:'#bfd4d5'},
  {id:'dining',name:'Dining',roomType:'dining_room',x:-.45,z:-2.55,width:5.35,length:3.55,color:'#d9c5a9'},
  {id:'kitchen',name:'Kitchen',roomType:'kitchen',x:2.85,z:-2.75,width:2.55,length:3.8,color:'#c6d2c8'},
  {id:'bath-1',name:'Bathroom 1',roomType:'master_bathroom',x:-3.15,z:-2.7,width:1.65,length:3.2,color:'#bfd4d5'},
  {id:'bedroom-1',name:'Bedroom 1',roomType:'master_bedroom',x:-2.15,z:-6.65,width:4.1,length:4.15,color:'#c9c5d8'},
  {id:'bedroom-2',name:'Bedroom 2',roomType:'bedroom',x:2.15,z:-6.65,width:4.1,length:4.15,color:'#c5d4ce'},
  {id:'bath-2',name:'Bathroom 2',roomType:'bathroom',x:3.25,z:-3.95,width:1.65,length:2.0,color:'#bfd4d5'},
  {id:'balcony',name:'Balcony',roomType:'balcony',x:0,z:-9.35,width:8.35,length:1.25,color:'#c7d4cd'},
 ]
}];
