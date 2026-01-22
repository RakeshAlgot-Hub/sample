import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Building, Layers, Grid3X3, BedDouble, MapPin, Phone, Loader2 } from 'lucide-react';
import { Button } from '././ui/button';
import { usePropertyWizardStore } from '../../stores/propertyWizardStore';
import { useAuth } from '../../contexts/AuthContext';
import { wizardApi } from '../../services/api';
import { CreateFullPropertyRequest, CreateFullPropertyResponse } from '../../types/api';
import { Property } from '../../types/property';
import { useToast } from '../../hooks/use-toast';

const StepReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    propertyName, country, state, city, address, phone,
    buildings, floors, rooms, reset
  } = usePropertyWizardStore();

  const totalFloors = floors.length;
  const totalRooms = rooms.length;
  
  // Calculate total beds from rooms (which now have correct share types)
  const totalBeds = rooms.reduce((acc, r) => acc + (r.shareType || 0), 0);

  const handleCreate = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a property.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Send complete property data to backend
      // Backend handles: buildings, floors, rooms, and auto-creates beds
      const response = await wizardApi.createFullProperty({
        property: {
          name: propertyName,
          country,
          state,
          city,
          address,
          phone,
        },
        buildings: buildings.map(b => ({
          name: b.name,
          floor_count: b.floorCount,
        })),
        floors: floors.map(f => ({
          building_index: f.buildingIndex,
          floor_number: f.floorNumber,
          room_count: f.roomCount,
        })),
        rooms: rooms.map(r => ({
          building_index: r.buildingIndex,
          floor_number: r.floorNumber,
          room_number: r.roomNumber,
          share_type: r.shareType,
        })),
      });

      toast({
        title: 'Property Created! 🎉',
        description: `${propertyName} has been created successfully with ${response.total_beds} beds.`,
      });

      reset();
      navigate('/dashboard');

    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'There was an error creating your property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
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
          <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Review & Create</h2>
        <p className="text-muted-foreground mt-2">Review your property setup before creating</p>
      </div>

      {/* Property Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          Property Details
        </h3>
        
        <div className="space-y-3">
          <div>
            <span className="text-2xl font-bold text-foreground">{propertyName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{address}, {city}, {state}, {country}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building, label: 'Buildings', value: buildings.length },
          { icon: Layers, label: 'Floors', value: totalFloors },
          { icon: Grid3X3, label: 'Rooms', value: totalRooms },
          { icon: BedDouble, label: 'Beds', value: totalBeds },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-muted/50 rounded-xl p-4 text-center"
          >
            <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Building Breakdown */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Building Breakdown</h3>
        <div className="space-y-4">
          {buildings.map((building, bi) => {
            const buildingRooms = rooms.filter(r => r.buildingIndex === bi);
            const buildingBeds = buildingRooms.reduce((acc, r) => acc + r.shareType, 0);

            return (
              <div key={bi} className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{building.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {buildingBeds} beds
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{building.floorCount} floors</span>
                  <span>•</span>
                  <span>{buildingRooms.length} rooms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capacity Notice */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Maximum Capacity</p>
            <p className="text-sm text-muted-foreground">
              Your property can accommodate up to <strong>{totalBeds} members</strong> at full occupancy.
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating Property...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Create Property
          </>
        )}
      </Button>
    </div>
  );
};

export default StepReview;
