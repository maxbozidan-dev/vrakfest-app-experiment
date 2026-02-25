export type UserRole = 'administrator' | 'jezdec' | 'divak';

export type AppModule =
  | 'jezdci'
  | 'turnaj'
  | 'kontrola'
  | 'bodove-poradei'
  | 'statistiky'
  | 'udalosti'
  | 'hlasovani'
  | 'komunikace'
  | 'pravidla'
  | 'bazar'
  | 'settings';

export const roleLabels: Record<UserRole, string> = {
  administrator: 'Administrátor',
  jezdec: 'Jezdec',
  divak: 'Divák'
};

const adminOnly: AppModule[] = ['kontrola', 'settings'];
const readOnlyForNonAdmin: AppModule[] = ['pravidla'];

export const canAccessModule = (role: UserRole, module: AppModule) => {
  if (adminOnly.includes(module)) {
    return role === 'administrator';
  }
  return true;
};

export const canEditRules = (role: UserRole) => role === 'administrator';
export const canModerateMarketplace = (role: UserRole) => role === 'administrator';
export const canManageVoting = (role: UserRole) => role === 'administrator';
export const canControlRace = (role: UserRole) => role === 'administrator';

export const isReadOnlyModule = (role: UserRole, module: AppModule) => {
  return readOnlyForNonAdmin.includes(module) && role !== 'administrator';
};
