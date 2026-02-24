import React, { memo } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { assetUrl } from '@/lib/assetUrl';

interface DashboardHeaderProps {
  racerCount: number;
  activeRacerCount: number;
  onReset: () => void;
  currentInfo?: string; // Pro zobrazení aktuálních informací
  userRole?: 'admin' | 'user';
  onRoleChange?: (role: 'admin' | 'user') => void;
}

export const DashboardHeader = memo(({
  racerCount,
  activeRacerCount,
  onReset,
  currentInfo = "Vítejte v závodní aplikaci",
  userRole = 'admin',
  onRoleChange
}: DashboardHeaderProps) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-[72px] md:h-20 pt-1 flex items-center justify-between px-3 md:px-6 z-50 relative pointer-events-auto">
      {/* HUD Top Bar Background */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>

      <div className="flex items-center gap-3 md:gap-6 z-10 w-full">
        <button
          type="button"
          aria-label="Otevřít menu"
          onClick={toggleSidebar}
          className="md:hidden h-9 w-9 text-racing-yellow hover:text-white transition-colors flex items-center justify-center"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="md:hidden flex-1 flex justify-center">
          <img
            src={assetUrl('/media/logos/vrakfest-mobile-header.jpg')}
            alt="Vrakfest"
            className="h-12 w-auto object-contain"
          />
        </div>

        <button
          type="button"
          aria-label="Notifikace"
          className="md:hidden relative h-9 w-9 text-racing-yellow hover:text-white transition-colors flex items-center justify-center"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-racing-yellow" />
        </button>

        {/* Dynamic Ticker HUD Element */}
        <div className="flex-1 hidden md:flex items-center">
          <div className="h-8 bg-black/60 border-l-2 border-r-2 border-racing-yellow/50 px-4 flex items-center w-full max-w-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-racing-yellow/5"></div>
            <div className="w-full overflow-hidden">
              <div className="animate-[scroll-right_20s_linear_infinite] text-racing-yellow/80 font-tech text-xs uppercase tracking-[0.2em] whitespace-nowrap">
                {currentInfo} <span className="text-white/20 mx-4">///</span> STAV SYSTÉMU: ONLINE <span className="text-white/20 mx-4">///</span> TEPLOTA TRATI: 24°C <span className="text-white/20 mx-4">///</span> VÍTR: 12KM/H SZ <span className="text-white/20 mx-4">///</span> {currentInfo}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-white font-bebas tracking-wide leading-none text-lg">PROFIL JEZDCE</div>
              <div className="text-racing-yellow font-tech text-[10px] tracking-widest uppercase">Úroveň přístupu 5</div>
            </div>
            <div className="w-10 h-10 bg-racing-yellow flex items-center justify-center border-2 border-white/10">
              <User className="h-5 w-5 text-black" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});