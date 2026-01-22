import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Users, BedDouble, Home, LogOut, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { propertiesApi } from '../services/api'; // propertiesApi still imported from services/api
import { Property } from '../types/property'; // Import Property from types
import { useToast } from '../hooks/use-toast';
import PropertyCard from '../components/PropertyCard';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user, isLoading: authIsLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authIsLoading && !user) {
      navigate('/auth');
    }
  }, [user, authIsLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.list();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your properties...</p>
        </div>
      </div>
    );
  }

  // Stats calculated from backend-provided data
  const totalBeds = properties.reduce((acc, p) => acc + p.bed_count, 0);
  const occupiedBeds = properties.reduce((acc, p) => acc + p.occupied_beds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PropertyPal</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <EmptyState onCreateProperty={() => navigate('/create-property')} />
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { icon: Home, label: 'Properties', value: properties.length, color: 'primary' },
                { icon: LayoutGrid, label: 'Total Rooms', value: properties.reduce((acc, p) => acc + p.room_count, 0), color: 'accent' },
                { icon: BedDouble, label: 'Total Beds', value: totalBeds, color: 'success' },
                { icon: Users, label: 'Occupancy', value: `${occupiedBeds}/${totalBeds}`, color: 'warning' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Properties Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your Properties</h1>
                <p className="text-muted-foreground">Manage all your properties from one place</p>
              </div>
              <Button 
                onClick={() => navigate('/create-property')}
                className="gradient-primary hover:opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Property
              </Button>
            </div>

            {/* Properties Grid */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {properties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={{
                    id: property.id,
                    name: property.name,
                    city: property.city,
                    state: property.state,
                    country: property.country,
                    buildingCount: property.building_count,
                    roomCount: property.room_count,
                    bedCount: property.bed_count,
                    occupiedBeds: property.occupied_beds,
                  }} 
                  index={index}
                  onSelect={() => navigate(`/property/${property.id}`)}
                />
              ))}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
