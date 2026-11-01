import React from 'react';
import {
  Wallet,
  Users,
  PlusCircle,
  Home,
  ShoppingCart,
  Car,
  Zap,
  HeartPulse,
  GraduationCap,
  Compass,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  PiggyBank,
  CreditCard,
  Building,
  Coins,
  ArrowRightLeft,
  CircleDollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  Users,
  PlusCircle,
  Home,
  ShoppingCart,
  Car,
  Zap,
  HeartPulse,
  GraduationCap,
  Compass,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  PiggyBank,
  CreditCard,
  Building,
  Coins,
  ArrowRightLeft,
  CircleDollarSign,
  Briefcase,
  Layers,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', color }) => {
  const IconComponent = iconMap[name] || Layers;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
