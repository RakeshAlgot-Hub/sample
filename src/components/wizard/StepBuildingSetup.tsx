import { motion } from 'framer-motion';
import { Layers, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { usePropertyWizardStore } from '../../stores/propertyWizardStore';


const StepBuildingSetup = () => {
  const { 
    buildings, buildingCount, currentBuildingIndex,
    setBuilding, nextBuilding, initializeFloors, nextStep 
  } = usePropertyWizardStore();

  const currentBuilding = buildings[currentBuildingIndex];

  const adjustFloorCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(50, currentBuilding.floorCount + delta));
    setBuilding(currentBuildingIndex, { floorCount: newCount });
  };

  const handleNext = () => {
    const hasMoreBuildings = nextBuilding();
    if (!hasMoreBuildings) {
      initializeFloors();
      nextStep();
    }
  };

  if (!currentBuilding) return null;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <motion.div 
          className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <Layers className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Building Setup</h2>
        {buildingCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-muted-foreground">Setting up</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Building {currentBuildingIndex + 1} of {buildingCount}
            </span>
          </div>
        )}
      </div>

      {/* Progress for multiple buildings */}
      {buildingCount > 1 && (
        <div className="flex gap-2 justify-center mb-6">
          {Array.from({ length: buildingCount }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i < currentBuildingIndex 
                  ? 'bg-success' 
                  : i === currentBuildingIndex 
                    ? 'bg-primary' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Building Name */}
        <div>
          <Label htmlFor="buildingName" className="text-sm font-medium">Building Name</Label>
          <Input
            id="buildingName"
            value={currentBuilding.name}
            onChange={(e) => setBuilding(currentBuildingIndex, { name: e.target.value })}
            placeholder="e.g., Main Building"
            className="h-12 mt-1.5"
          />
          <p className="text-sm text-muted-foreground mt-1">Optional - you can keep the default name</p>
        </div>

        {/* Floor Count */}
        <div className="bg-muted/50 rounded-2xl p-6">
          <Label className="text-sm font-medium mb-4 block">Number of Floors</Label>
          <div className="flex items-center justify-center gap-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustFloorCount(-1)}
              disabled={currentBuilding.floorCount <= 1}
              className="w-12 h-12 rounded-xl"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <span className="text-5xl font-bold text-foreground">{currentBuilding.floorCount}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {currentBuilding.floorCount === 1 ? 'Floor' : 'Floors'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustFloorCount(1)}
              disabled={currentBuilding.floorCount >= 50}
              className="w-12 h-12 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Preview</h3>
          <div className="flex flex-col-reverse gap-2">
            {Array.from({ length: Math.min(currentBuilding.floorCount, 10) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
                className="h-8 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center"
              >
                <span className="text-xs font-medium text-primary">Floor {currentBuilding.floorCount - i}</span>
              </motion.div>
            ))}
            {currentBuilding.floorCount > 10 && (
              <div className="text-center text-sm text-muted-foreground py-2">
                ... and {currentBuilding.floorCount - 10} more floors
              </div>
            )}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        {currentBuildingIndex < buildingCount - 1 
          ? `Continue to Building ${currentBuildingIndex + 2}` 
          : 'Continue to Floor Configuration'
        }
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default StepBuildingSetup;
