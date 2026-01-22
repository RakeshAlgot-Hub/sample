import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, ArrowLeft, MapPin, Phone, Building, 
  Grid3X3, BedDouble, Users, Search, UserPlus, Pencil, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { propertyDetailsApi, membersApi, propertiesApi } from '../services/api';
import { PropertyDetails, UpdatePropertyRequest } from '../types/api';
import { Member } from '../types/member';
import { useToast } from '../hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'structure' | 'members'>('structure');
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedDetails, setEditedDetails] = useState<UpdatePropertyRequest>({});


  // Member Form State
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', address: '' });
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !user) {
      navigate('/auth');
    }
  }, [user, authIsLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPropertyData();
    }
  }, [user, id]);

  const fetchPropertyData = async () => {
    if (!id) return;
    
    try {
      const data = await propertyDetailsApi.get(id);
      setPropertyDetails(data);
      setEditedDetails({
        name: data.property.name,
        country: data.property.country,
        state: data.property.state,
        city: data.property.city,
        addressLine: data.property.addressLine
      })
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProperty = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await propertiesApi.update(id, editedDetails);
      toast({ title: 'Property updated successfully!' });
      setShowEditDialog(false);
      fetchPropertyData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update property.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!id) return;
    try {
      await propertiesApi.delete(id);
      toast({ title: 'Property deleted successfully!' });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete property.',
        variant: 'destructive',
      });
    }
  };


  const handleAddMember = async () => {
    if (!memberForm.name || !memberForm.phone || !id) {
      toast({
        title: 'Validation Error',
        description: 'Name and phone are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingMember) {
        // Update existing member
        await membersApi.update(editingMember.id, {
          name: memberForm.name,
          phone: memberForm.phone,
          address: memberForm.address,
          bed_id: selectedBedId,
        });
        toast({ title: 'Member updated successfully!' });
      } else {
        // Create new member
        await membersApi.create({
          property_id: id,
          name: memberForm.name,
          phone: memberForm.phone,
          address: memberForm.address,
          bed_id: selectedBedId,
        });
        toast({ title: 'Member added successfully!' });
      }

      setShowMemberDialog(false);
      setMemberForm({ name: '', phone: '', address: '' });
      setSelectedBedId(null);
      setEditingMember(null);
      fetchPropertyData();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save member.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    try {
      await membersApi.delete(member.id);
      toast({ title: 'Member removed successfully!' });
      fetchPropertyData();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  const openEditMember = (member: Member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      phone: member.phone,
      address: member.address || '',
    });
    setSelectedBedId(member.bed_id);
    setShowMemberDialog(true);
  };

  const getAvailableBeds = () => {
    if (!propertyDetails) return [];
    
    const availableBeds: { id: string; label: string }[] = [];
    propertyDetails.buildings.forEach(building => {
      building.floors.forEach(floor => {
        floor.rooms.forEach(room => {
          room.beds.forEach(bed => {
            if (!bed.is_occupied || (editingMember && editingMember.bed_id === bed.id)) {
              availableBeds.push({
                id: bed.id,
                label: `${building.name} > Floor ${floor.floor_number} > Room ${room.room_number} > Bed ${bed.bed_number}`,
              });
            }
          });
        });
      });
    });
    return availableBeds;
  };

  const filteredMembers = propertyDetails?.members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  ) || [];

  if (authIsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!propertyDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const { property, buildings, stats } = propertyDetails;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">{property.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.city}, {property.state}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Property</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={editedDetails.name} onChange={(e) => setEditedDetails(p => ({...p, name: e.target.value}))} />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={editedDetails.country} onChange={(e) => setEditedDetails(p => ({...p, country: e.target.value}))} />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={editedDetails.state} onChange={(e) => setEditedDetails(p => ({...p, state: e.target.value}))} />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={editedDetails.city} onChange={(e) => setEditedDetails(p => ({...p, city: e.target.value}))} />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={editedDetails.addressLine} onChange={(e) => setEditedDetails(p => ({...p, addressLine: e.target.value}))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateProperty} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the property and all its associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProperty}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats - from backend */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { icon: Building, label: 'Buildings', value: stats.building_count },
            { icon: Grid3X3, label: 'Rooms', value: stats.room_count },
            { icon: BedDouble, label: 'Beds', value: stats.bed_count },
            { icon: Users, label: 'Occupied', value: `${stats.occupied_beds}/${stats.bed_count}` },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border">
              <stat.icon className="w-6 h-6 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'structure' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Structure
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'members' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Members ({propertyDetails.members.length})
          </button>
        </div>

        {activeTab === 'structure' ? (
          /* Structure View */
          <div className="space-y-4">
            {buildings.map((building) => (
              <div key={building.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">{building.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {building.floors.length} floors • {building.floors.reduce((a, f) => a + f.rooms.length, 0)} rooms
                  </p>
                </div>
                
                <Accordion type="single" collapsible>
                  {building.floors.map((floor) => (
                    <AccordionItem key={floor.id} value={floor.id}>
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">Floor {floor.floor_number}</span>
                          <span className="text-sm text-muted-foreground">
                            {floor.rooms.length} rooms
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {floor.rooms.map((room) => {
                            const occupied = room.beds.filter(b => b.is_occupied).length;
                            return (
                              <div key={room.id} className="bg-muted/30 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Room {room.room_number}</span>
                                  <span className={`text-sm px-2 py-0.5 rounded ${
                                    occupied === room.beds.length 
                                      ? 'bg-success/20 text-success' 
                                      : occupied > 0 
                                        ? 'bg-warning/20 text-warning' 
                                        : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {occupied}/{room.beds.length}
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {room.beds.map((bed) => (
                                    <div
                                      key={bed.id}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                                        bed.is_occupied 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                      title={bed.is_occupied ? 'Occupied' : 'Available'}
                                    >
                                      {bed.bed_number}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          /* Members View */
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Dialog open={showMemberDialog} onOpenChange={(open) => {
                setShowMemberDialog(open);
                if (!open) {
                  setEditingMember(null);
                  setMemberForm({ name: '', phone: '', address: '' });
                  setSelectedBedId(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary h-12">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                    <DialogDescription>
                      {editingMember ? 'Update member details' : 'Fill in the member details'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={memberForm.name}
                        onChange={(e) => setMemberForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Member name"
                      />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={memberForm.address}
                        onChange={(e) => setMemberForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="Address"
                      />
                    </div>
                    <div>
                      <Label>Assign Bed</Label>
                      <Select value={selectedBedId || ''} onValueChange={(v) => setSelectedBedId(v || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bed (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableBeds().map(bed => (
                            <SelectItem key={bed.id} value={bed.id}>
                              {bed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMemberDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember} disabled={isSaving}>
                      {isSaving ? 'Saving...' : (editingMember ? 'Update' : 'Add Member')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No members found matching your search' : 'No members yet. Add your first member!'}
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <Phone className="w-3 h-3 inline mr-1" />
                        {member.phone}
                      </p>
                      {member.bed_id && (
                        <p className="text-xs text-primary mt-1">
                          <BedDouble className="w-3 h-3 inline mr-1" />
                          Assigned to bed
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditMember(member)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.name}? This will also free up their assigned bed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMember(member)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertyDetail;
