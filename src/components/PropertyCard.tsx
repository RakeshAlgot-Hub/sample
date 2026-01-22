import { motion } from 'framer-motion';
import { Building, BedDouble, Users, MapPin, ChevronRight } from 'lucide-react';
import { Property } from '../types/property'; // Import the Property type

interface PropertyCardProps {
  property: Property; // Use the imported Property type
  index: number;
  onSelect: () => void;
}

const PropertyCard = ({ property, index, onSelect }: PropertyCardProps) => {
  const occupancyRate = property.bed_count > 0 
    ? Math.round((property.occupied_beds / property.bed_count) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onSelect}
      className="group bg-card rounded-2xl border border-border p-6 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <Building className="w-6 h-6 text-primary-foreground" />
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {property.name}
      </h3>
      
      <div className="flex items-center gap-1 text-muted-foreground mb-4">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">{property.city}, {property.state}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
            <Building className="w-4 h-4 text-muted-foreground" />
            {property.building_count}
          </div>
          <p className="text-xs text-muted-foreground">Buildings</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
            <BedDouble className="w-4 h-4 text-muted-foreground" />
            {property.bed_count}
          </div>
          <p className="text-xs text-muted-foreground">Beds</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
            <Users className="w-4 h-4 text-muted-foreground" />
            {property.occupied_beds}
          </div>
          <p className="text-xs text-muted-foreground">Occupied</p>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Occupancy</span>
          <span className={`font-semibold ${occupancyRate >= 80 ? 'text-success' : occupancyRate >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>
            {occupancyRate}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${occupancyRate >= 80 ? 'bg-success' : occupancyRate >= 50 ? 'bg-warning' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${occupancyRate}%` }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
