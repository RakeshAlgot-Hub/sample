import { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { usePropertyWizardStore } from '../../stores/propertyWizardStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { FloorConfig, FloorShareDecision } from '../../types/propertyWizard';

const shareTypes = [
  { label: '1 Bed', value: 1 },
  { label: '2 Beds', value: 2 },
  { label: '3 Beds', value: 3 },
  { label: '4 Beds', value: 4 },
  { label: '5 Beds', value: 5 },
  { label: 'Custom', value: 0 },
];

const StepShareTypeDecision = () => {
  const { 
    buildings, floors, floorShareDecisions, 
    setFloorShareDecision, initializeRooms, nextStep, hasIndividualFloors, setCurrentStep 
  } = usePropertyWizardStore();
  
  const [openFloor, setOpenFloor] = useState<string | undefined>(undefined);
  const [customValues, setCustomValues] = useState<Record<string, number>>({});

  const getFloorsForBuilding = (buildingIndex: number) => {
    return floors.filter(f => f.buildingIndex === buildingIndex).sort((a, b) => a.floorNumber - b.floorNumber);
  };

  const getDecision = (buildingIndex: number, floorNumber: number) => {
    return floorShareDecisions.find(
      d => d.buildingIndex === buildingIndex && d.floorNumber === floorNumber
    );
  };

  const getFloorConfig = (buildingIndex: number, floorNumber: number) => {
    return floors.find(f => f.buildingIndex === buildingIndex && f.floorNumber === floorNumber);
  };

  const handleSameForAllChange = (buildingIndex: number, floorNumber: number, value: string) => {
    const sameForAll = value === 'same';
    setFloorShareDecision(buildingIndex, floorNumber, sameForAll, undefined);
  };

  const handleShareTypeSelect = (buildingIndex: number, floorNumber: number, shareType: number) => {
    const key = `${buildingIndex}-${floorNumber}`;
    if (shareType === 0) {
      // Custom - use custom value or default to 6
      const customValue = customValues[key] || 6;
      setFloorShareDecision(buildingIndex, floorNumber, true, customValue);
    } else {
      setFloorShareDecision(buildingIndex, floorNumber, true, shareType);
    }
  };

  const handleCustomValueChange = (buildingIndex: number, floorNumber: number, value: number) => {
    const key = `${buildingIndex}-${floorNumber}`;
    setCustomValues(prev => ({ ...prev, [key]: value }));
    setFloorShareDecision(buildingIndex, floorNumber, true, value);
  };

  const isCustomShareType = (shareType?: number) => shareType !== undefined && shareType > 5;

  const calculateTotalBeds = () => {
    let total = 0;
    floors.forEach(floor => {
      const decision = getDecision(floor.buildingIndex, floor.floorNumber);
      if (decision?.sameForAll && decision.uniformShareType) {
        total += floor.roomCount * decision.uniformShareType;
      }
      // Individual floors will be calculated in room config step
    });
    return total;
  };

  const allFloorsConfigured = () => {
    return floors.every(floor => {
      const decision = getDecision(floor.buildingIndex, floor.floorNumber);
      if (!decision) return false;
      if (decision.sameForAll) {
        return decision.uniformShareType !== undefined && decision.uniformShareType > 0;
      }
      return true; // Individual config will be done in next step
    });
  };

  const handleNext = () => {
    initializeRooms();
    // If any floor has individual config, go to room config step
    // Otherwise skip to review
    if (hasIndividualFloors()) {
      nextStep(); // Go to step 5 (room config)
    } else {
      setCurrentStep(6); // Skip to review
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
          <BedDouble className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Room Share Setup</h2>
        <p className="text-muted-foreground mt-2">Configure share types for each floor</p>
      </div>

      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
        {buildings.map((building, buildingIndex) => (
          <div key={buildingIndex} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border sticky top-0 z-10">
              <h3 className="font-semibold text-foreground">{building.name}</h3>
            </div>
            
            <Accordion type="single" collapsible value={openFloor} onValueChange={setOpenFloor}>
              {getFloorsForBuilding(buildingIndex).map((floor) => {
                const decision = getDecision(buildingIndex, floor.floorNumber);
                const floorKey = `${buildingIndex}-${floor.floorNumber}`;
                const floorConfig = getFloorConfig(buildingIndex, floor.floorNumber);
                const roomCount = floorConfig?.roomCount || 0;
                
                return (
                  <AccordionItem key={floorKey} value={floorKey}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium">Floor {floor.floorNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                          </span>
                          {decision?.sameForAll && decision.uniformShareType && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {decision.uniformShareType} share
                            </span>
                          )}
                          {decision && !decision.sameForAll && (
                            <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded-full">
                              Individual
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {/* Same or Individual Selection */}
                        <div className="bg-muted/30 rounded-xl p-4">
                          <p className="text-sm font-medium text-foreground mb-3">
                            Do all rooms on this floor have the same share type?
                          </p>
                          <RadioGroup
                            value={decision?.sameForAll ? 'same' : 'individual'}
                            onValueChange={(value) => handleSameForAllChange(buildingIndex, floor.floorNumber, value)}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="same" id={`${floorKey}-same`} />
                              <Label htmlFor={`${floorKey}-same`} className="flex-1 cursor-pointer">
                                <span className="font-medium">Yes, same for all rooms</span>
                                <p className="text-sm text-muted-foreground">Apply one share type to all {roomCount} rooms</p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value="individual" id={`${floorKey}-individual`} />
                              <Label htmlFor={`${floorKey}-individual`} className="flex-1 cursor-pointer">
                                <span className="font-medium">No, set share type individually</span>
                                <p className="text-sm text-muted-foreground">Configure each room separately</p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Share Type Selection (only if sameForAll) */}
                        {decision?.sameForAll && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-muted/30 rounded-xl p-4"
                          >
                            <p className="text-sm font-medium text-foreground mb-3">
                              Select share type for all rooms on Floor {floor.floorNumber}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {shareTypes.map((type) => {
                                const isSelected = type.value === 0 
                                  ? isCustomShareType(decision.uniformShareType)
                                  : decision.uniformShareType === type.value;
                                
                                return (
                                  <button
                                    key={type.value}
                                    onClick={() => handleShareTypeSelect(buildingIndex, floor.floorNumber, type.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

                            {isCustomShareType(decision.uniformShareType) && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Custom beds per room:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={decision.uniformShareType || 6}
                                  onChange={(e) => handleCustomValueChange(
                                    buildingIndex, 
                                    floor.floorNumber, 
                                    parseInt(e.target.value) || 6
                                  )}
                                  className="w-20 h-9"
                                />
                              </div>
                            )}

                            {decision.uniformShareType && decision.uniformShareType > 0 && (
                              <div className="mt-4 p-3 bg-success/10 rounded-lg flex items-center justify-between">
                                <span className="text-sm text-foreground">
                                  This will apply to all {roomCount} rooms on this floor
                                </span>
                                <span className="font-semibold text-foreground">
                                  {roomCount * decision.uniformShareType} beds
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {decision && !decision.sameForAll && (
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              You'll configure each room individually in the next step.
                            </p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Summary */}
      {calculateTotalBeds() > 0 && (
        <div className="bg-muted/50 rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Beds Preview (configured floors):</span>
            <span className="font-semibold text-foreground text-lg">{calculateTotalBeds()}</span>
          </div>
        </div>
      )}

      <Button 
        onClick={handleNext}
        disabled={!allFloorsConfigured()}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        {hasIndividualFloors() ? (
          <>
            Continue to Room Configuration
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        ) : (
          <>
            Review & Create Property
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default StepShareTypeDecision;
