import { Bed, ShareType } from '@/types/property';

export function generateBedsByShareType(shareType: ShareType): Bed[] {
  const bedCount = getBedCountByShareType(shareType);
  return generateBedsByCount(bedCount);
}

export function getBedCountByShareType(shareType: ShareType): number {
  switch (shareType) {
    case 'single':
      return 1;
    case 'double':
      return 2;
    case 'triple':
      return 3;
    default:
      return 0;
  }
}

export function generateBedsByCount(bedCount: number): Bed[] {
  const beds: Bed[] = [];

  for (let i = 1; i <= bedCount; i++) {
    beds.push({
      id: `B${i}`,
      occupied: false,
    });
  }

  return beds;
}
