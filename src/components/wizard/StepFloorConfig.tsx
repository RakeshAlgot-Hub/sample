import { motion } from 'framer-motion';
import { Grid3X3, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePropertyWizardStore } from '@/stores/propertyWizardStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState } from 'react';
import { FloorConfig } from '@/types/propertyWizard';

const StepFloorConfig = () => {
  const { buildings, floors, setFloor, initializeFloorShareDecisions, nextStep } = usePropertyWizardStore();
  const [openFloor, setOpenFloor] = useState<string | undefined>(undefined);

  const handleNext = () => {
    initializeFloorShareDecisions();
    nextStep();
  };

  const getFloorsForBuilding = (buildingIndex: number) => {
    return floors.filter(f => f.buildingIndex === buildingIndex).sort((a, b) => a.floorNumber - b.floorNumber);
  };

  const adjustRoomCount = (buildingIndex: number, floorNumber: number, delta: number) => {
    const floor = floors.find(f => f.buildingIndex === buildingIndex && f.floorNumber === floorNumber);
    if (floor) {
      const newCount = Math.max(1, Math.min(50, floor.roomCount + delta));
      setFloor(buildingIndex, floorNumber, newCount);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <motion.div 
          className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <Grid3X3 className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Floor Configuration</h2>
        <p className="text-muted-foreground mt-2">Set the number of rooms for each floor</p>
      </div>

      <div className="space-y-6">
        {buildings.map((building, buildingIndex) => (
          <div key={buildingIndex} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{building.name}</h3>
              <p className="text-sm text-muted-foreground">{building.floorCount} floors</p>
            </div>
            
            <Accordion type="single" collapsible value={openFloor} onValueChange={setOpenFloor}>
              {getFloorsForBuilding(buildingIndex).map((floor) => (
                <AccordionItem key={`${buildingIndex}-${floor.floorNumber}`} value={`${buildingIndex}-${floor.floorNumber}`}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">Floor {floor.floorNumber}</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {floor.roomCount} {floor.roomCount === 1 ? 'room' : 'rooms'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex items-center justify-center gap-6 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustRoomCount(buildingIndex, floor.floorNumber, -1)}
                        disabled={floor.roomCount <= 1}
                        className="w-10 h-10 rounded-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="text-center">
                        <span className="text-4xl font-bold text-foreground">{floor.roomCount}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {floor.roomCount === 1 ? 'Room' : 'Rooms'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustRoomCount(buildingIndex, floor.floorNumber, 1)}
                        disabled={floor.roomCount >= 50}
                        className="w-10 h-10 rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Summary - Only rooms, no beds */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Rooms:</span>
          <span className="font-semibold text-foreground">
            {floors.reduce((acc, f) => acc + f.roomCount, 0)}
          </span>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        Continue to Share Setup
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default StepFloorConfig;
