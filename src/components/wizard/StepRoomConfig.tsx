import { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePropertyWizardStore } from '@/stores/propertyWizardStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { FloorConfig, RoomConfig } from '@/types/propertyWizard';

const shareTypes = [
  { value: 1, label: '1 Share' },
  { value: 2, label: '2 Share' },
  { value: 3, label: '3 Share' },
  { value: 4, label: '4 Share' },
  { value: 5, label: '5 Share' },
  { value: 0, label: 'Custom' },
];

const StepRoomConfig = () => {
  const { buildings, floors, rooms, floorShareDecisions, setRoom, nextStep } = usePropertyWizardStore();
  const [openFloor, setOpenFloor] = useState<string | undefined>(undefined);
  const [customValues, setCustomValues] = useState<Record<string, number>>({});

  const handleNext = () => {
    nextStep();
  };

  // Only show floors that need individual room configuration
  const getIndividualFloors = (buildingIndex: number) => {
    return floors
      .filter(f => {
        const decision = floorShareDecisions.find(
          d => d.buildingIndex === f.buildingIndex && d.floorNumber === f.floorNumber
        );
        return f.buildingIndex === buildingIndex && decision && !decision.sameForAll;
      })
      .sort((a, b) => a.floorNumber - b.floorNumber);
  };

  const getBuildingsWithIndividualFloors = () => {
    return buildings.filter((_, buildingIndex) => getIndividualFloors(buildingIndex).length > 0);
  };

  const getRoomsForFloor = (buildingIndex: number, floorNumber: number) => {
    return rooms
      .filter(r => r.buildingIndex === buildingIndex && r.floorNumber === floorNumber)
      .sort((a, b) => a.roomNumber - b.roomNumber);
  };

  const handleShareTypeChange = (buildingIndex: number, floorNumber: number, roomNumber: number, shareType: number) => {
    if (shareType === 0) {
      // Custom - use the custom value or default to 6
      const key = `${buildingIndex}-${floorNumber}-${roomNumber}`;
      const customValue = customValues[key] || 6;
      setRoom(buildingIndex, floorNumber, roomNumber, customValue);
    } else {
      setRoom(buildingIndex, floorNumber, roomNumber, shareType);
    }
  };

  const handleCustomValueChange = (buildingIndex: number, floorNumber: number, roomNumber: number, value: number) => {
    const key = `${buildingIndex}-${floorNumber}-${roomNumber}`;
    setCustomValues(prev => ({ ...prev, [key]: value }));
    setRoom(buildingIndex, floorNumber, roomNumber, value);
  };

  const isCustom = (shareType: number) => shareType > 5;

  // Only count beds for floors with individual configuration
  const individualFloorBeds = rooms
    .filter(r => {
      const decision = floorShareDecisions.find(
        d => d.buildingIndex === r.buildingIndex && d.floorNumber === r.floorNumber
      );
      return decision && !decision.sameForAll;
    })
    .reduce((acc, r) => acc + (r.shareType || 0), 0);

  const allRoomsConfigured = () => {
    return rooms
      .filter(r => {
        const decision = floorShareDecisions.find(
          d => d.buildingIndex === r.buildingIndex && d.floorNumber === r.floorNumber
        );
        return decision && !decision.sameForAll;
      })
      .every(r => r.shareType > 0);
  };

  const buildingsWithIndividual = getBuildingsWithIndividualFloors();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <motion.div 
          className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <BedDouble className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Individual Room Configuration</h2>
        <p className="text-muted-foreground mt-2">Set share type for each room on floors with individual setup</p>
      </div>

      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
        {buildingsWithIndividual.map((building) => {
          const buildingIndex = buildings.indexOf(building);
          const individualFloors = getIndividualFloors(buildingIndex);
          
          return (
            <div key={buildingIndex} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border sticky top-0 z-10">
                <h3 className="font-semibold text-foreground">{building.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {individualFloors.length} floor{individualFloors.length !== 1 ? 's' : ''} with individual setup
                </p>
              </div>
              
              <Accordion type="single" collapsible value={openFloor} onValueChange={setOpenFloor}>
                {individualFloors.map((floor) => {
                  const floorRooms = getRoomsForFloor(buildingIndex, floor.floorNumber);
                  const floorBeds = floorRooms.reduce((acc, r) => acc + (r.shareType || 0), 0);
                  
                  return (
                    <AccordionItem key={`${buildingIndex}-${floor.floorNumber}`} value={`${buildingIndex}-${floor.floorNumber}`}>
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">Floor {floor.floorNumber}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {floor.roomCount} rooms
                            </span>
                            {floorBeds > 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {floorBeds} beds
                              </span>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {floorRooms.map((room) => (
                            <div key={room.roomNumber} className="bg-muted/30 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-foreground">Room {room.roomNumber}</span>
                                {room.shareType > 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    {room.shareType} bed{room.shareType !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {shareTypes.map((type) => {
                                  const isSelected = type.value === 0 
                                    ? isCustom(room.shareType) 
                                    : room.shareType === type.value;
                                  
                                  return (
                                    <button
                                      key={type.value}
                                      onClick={() => handleShareTypeChange(buildingIndex, floor.floorNumber, room.roomNumber, type.value)}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isSelected
                                          ? 'gradient-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                      }`}
                                    >
                                      {type.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {isCustom(room.shareType) && (
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Custom beds:</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={room.shareType}
                                    onChange={(e) => handleCustomValueChange(
                                      buildingIndex, 
                                      floor.floorNumber, 
                                      room.roomNumber, 
                                      parseInt(e.target.value) || 6
                                    )}
                                    className="w-20 h-9"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Beds (individual floors):</span>
          <span className="font-semibold text-foreground text-lg">{individualFloorBeds}</span>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        disabled={!allRoomsConfigured()}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        Review & Create Property
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default StepRoomConfig;
