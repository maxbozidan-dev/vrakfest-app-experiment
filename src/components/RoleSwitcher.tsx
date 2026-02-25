import { Shield, User, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole, roleLabels } from '@/types/roles';

interface RoleSwitcherProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

const roleIcon = {
  administrator: Shield,
  jezdec: User,
  divak: Eye,
};

export const RoleSwitcher = ({ role, onChange }: RoleSwitcherProps) => {
  const Icon = roleIcon[role];

  return (
    <div className="flex items-center gap-2 border border-racing-yellow/30 bg-black/60 px-3 py-2">
      <Icon className="w-4 h-4 text-racing-yellow" />
      <span className="font-tech text-[10px] uppercase tracking-widest text-white/60">Role</span>
      <Select value={role} onValueChange={(value) => onChange(value as UserRole)}>
        <SelectTrigger className="h-8 min-w-[150px] border-white/10 bg-transparent text-white rounded-none font-bebas text-xl tracking-wide">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none border-white/10 bg-[#111] text-white">
          {Object.entries(roleLabels).map(([value, label]) => (
            <SelectItem key={value} value={value} className="font-bebas text-lg tracking-wide focus:bg-racing-yellow/20 focus:text-white">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
