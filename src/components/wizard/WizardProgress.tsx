import { motion } from 'framer-motion';
import { Building, Layers, Grid3X3, BedDouble, Settings, CheckCircle2 } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { icon: Building, label: 'Property' },
  { icon: Layers, label: 'Buildings' },
  { icon: Grid3X3, label: 'Floors' },
  { icon: BedDouble, label: 'Share Type' },
  { icon: Settings, label: 'Rooms' },
  { icon: CheckCircle2, label: 'Review' },
];

const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  return (
    <div className="bg-card border-b border-border py-4">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-success text-success-foreground' 
                        : isActive 
                          ? 'gradient-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <step.icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
                
                {index < totalSteps - 1 && (
                  <div className="w-8 sm:w-16 lg:w-24 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${isCompleted ? 'bg-success' : 'bg-muted'}`}
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WizardProgress;
