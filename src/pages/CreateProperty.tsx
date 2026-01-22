import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { usePropertyWizardStore } from '../stores/propertyWizardStore';
import WizardProgress from '../components/wizard/WizardProgress';
import StepPropertyDetails from '../components/wizard/StepPropertyDetails';
import StepBuildingSetup from '../components/wizard/StepBuildingSetup';
import StepFloorConfig from '../components/wizard/StepFloorConfig';
import StepShareTypeDecision from '../components/wizard/StepShareTypeDecision';
import StepRoomConfig from '../components/wizard/StepRoomConfig';
import StepReview from '../components/wizard/StepReview';

const CreateProperty = () => {
  const { user, isLoading: loading } = useAuth();
  const navigate = useNavigate();
  const { currentStep, reset } = usePropertyWizardStore();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Reset wizard state when mounting
    reset();
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPropertyDetails />;
      case 2:
        return <StepBuildingSetup />;
      case 3:
        return <StepFloorConfig />;
      case 4:
        return <StepShareTypeDecision />;
      case 5:
        return <StepRoomConfig />;
      case 6:
        return <StepReview />;
      default:
        return <StepPropertyDetails />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">Create Property</span>
                <p className="text-sm text-muted-foreground">Step {currentStep} of 6</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <WizardProgress currentStep={currentStep} totalSteps={6} />

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </main>
    </div>
  );
};

export default CreateProperty;
