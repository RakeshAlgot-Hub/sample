import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, Phone, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePropertyWizardStore } from '@/stores/propertyWizardStore';
import { z } from 'zod';
import { propertyDetailsSchema as schema } from '@/types/propertyWizardSchemas';

const StepPropertyDetails = () => {
  const { 
    propertyName, country, state, city, address, phone, buildingCount,
    setPropertyDetails, initializeBuildings, nextStep 
  } = usePropertyWizardStore();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    try {
      schema.parse({ propertyName, country, state, city, address, phone, buildingCount });
      setErrors({});
      initializeBuildings();
      nextStep();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const adjustBuildingCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(20, buildingCount + delta));
    setPropertyDetails({ buildingCount: newCount });
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
          <Building className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Property Details</h2>
        <p className="text-muted-foreground mt-2">Let's start with the basic information about your property</p>
      </div>

      <div className="space-y-6">
        {/* Property Name */}
        <div>
          <Label htmlFor="propertyName" className="text-sm font-medium">Property Name</Label>
          <Input
            id="propertyName"
            value={propertyName}
            onChange={(e) => setPropertyDetails({ propertyName: e.target.value })}
            placeholder="e.g., Sunrise Hostel"
            className={`h-12 mt-1.5 ${errors.propertyName ? 'border-destructive' : ''}`}
          />
          {errors.propertyName && <p className="text-sm text-destructive mt-1">{errors.propertyName}</p>}
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="country" className="text-sm font-medium">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setPropertyDetails({ country: e.target.value })}
              placeholder="Country"
              className={`h-12 mt-1.5 ${errors.country ? 'border-destructive' : ''}`}
            />
            {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-medium">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setPropertyDetails({ state: e.target.value })}
              placeholder="State"
              className={`h-12 mt-1.5 ${errors.state ? 'border-destructive' : ''}`}
            />
            {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
          </div>
          <div>
            <Label htmlFor="city" className="text-sm font-medium">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setPropertyDetails({ city: e.target.value })}
              placeholder="City"
              className={`h-12 mt-1.5 ${errors.city ? 'border-destructive' : ''}`}
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* Full Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Full Address
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setPropertyDetails({ address: e.target.value })}
            placeholder="Street address, building number, etc."
            className={`h-12 mt-1.5 ${errors.address ? 'border-destructive' : ''}`}
          />
          {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Contact Phone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPropertyDetails({ phone: e.target.value })}
            placeholder="+1 234 567 8900"
            className={`h-12 mt-1.5 ${errors.phone ? 'border-destructive' : ''}`}
          />
          {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
        </div>

        {/* Building Count */}
        <div className="bg-muted/50 rounded-2xl p-6">
          <Label className="text-sm font-medium mb-4 block">Number of Buildings</Label>
          <div className="flex items-center justify-center gap-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustBuildingCount(-1)}
              disabled={buildingCount <= 1}
              className="w-12 h-12 rounded-xl"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <span className="text-5xl font-bold text-foreground">{buildingCount}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {buildingCount === 1 ? 'Building' : 'Buildings'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => adjustBuildingCount(1)}
              disabled={buildingCount >= 20}
              className="w-12 h-12 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90"
      >
        Continue to Building Setup
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default StepPropertyDetails;
