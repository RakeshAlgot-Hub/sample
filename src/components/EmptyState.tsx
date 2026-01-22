import { motion } from 'framer-motion';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  onCreateProperty: () => void;
}

const EmptyState = ({ onCreateProperty }: EmptyStateProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-16 h-16 text-primary" />
        </div>
        <motion.div 
          className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full gradient-accent flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <Plus className="w-6 h-6 text-accent-foreground" />
        </motion.div>
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-4">
        No Properties Yet
      </h2>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        You haven't added any properties yet. Create your first property 
        and start managing your hostel or apartment with ease.
      </p>

      <Button 
        onClick={onCreateProperty}
        size="lg"
        className="h-14 px-8 text-lg gradient-primary hover:opacity-90 shadow-glow transition-all"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Property
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        {[
          { emoji: '🏠', text: 'Add buildings & floors' },
          { emoji: '🛏️', text: 'Configure rooms & beds' },
          { emoji: '👥', text: 'Manage members easily' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <span className="text-4xl mb-2">{item.emoji}</span>
            <span className="text-sm text-muted-foreground">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmptyState;
