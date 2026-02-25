import { Home, Users, Trophy, BarChart3, Settings, Calendar, Car, BookOpen, Activity, ShoppingCart, MessageSquare, User } from 'lucide-react';
import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { assetUrl } from '@/lib/assetUrl';
import { canAccessModule } from '@/types/roles';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'administrator' | 'jezdec' | 'divak';
}

const menuItems = [
  { id: 'jezdci', label: 'Nástěnka', icon: Home },
  { id: 'turnaj', label: 'Program závodu', icon: Users },
  { id: 'zavod', label: 'Závod', icon: Car },
  { id: 'bodove-poradei', label: 'Bodové pořadí', icon: BarChart3 },
  { id: 'udalosti', label: 'Kalendář akcí', icon: Calendar },
  { id: 'hlasovani', label: 'Hlasování', icon: Activity },
  { id: 'komunikace', label: 'Komunikace', icon: MessageSquare },
  { id: 'pravidla', label: 'Pravidla závodu', icon: BookOpen },
  { id: 'bazar', label: 'Marketplace', icon: ShoppingCart },
  { id: 'settings', label: 'Nastavení', icon: Settings },
];

export const AppSidebar = memo(({ activeTab, onTabChange, role }: AppSidebarProps) => {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { toast } = useToast();
  const [isEventSettingsOpen, setIsEventSettingsOpen] = useState(false);
  const [eventSettings, setEventSettings] = useState(() => {
    const saved = localStorage.getItem('vrakfest-event-settings');
    return saved ? JSON.parse(saved) : {
      eventName: 'VrakFest Ostrava',
      eventDate: '2025-09-13',
      eventTime: '10:00',
      ctaText: 'Registruj se',
      ctaLink: '#'
    };
  });

  const handleSaveEventSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vrakfest-event-settings', JSON.stringify(eventSettings));
    setIsEventSettingsOpen(false);
    toast({
      title: "Nastavení uloženo",
      description: "Údaje o události byly úspěšně aktualizovány.",
    });
  };

  const visibleMenuItems = menuItems.filter(item => canAccessModule(role, item.id as any));



  return (
    <Sidebar className="border-none bg-transparent h-screen" collapsible="offcanvas" variant="sidebar">
      <SidebarContent className="bg-[#0a0a0a] border-r border-white/5 relative flex flex-col h-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        {/* Header - Compact */}
        <div className="px-4 py-8 border-b border-white/5 flex justify-center">
          <img src={assetUrl('/LOGO-short-Y.png')} alt="Vrakfest Logo" className="w-[130px] md:w-[160px] h-auto" />
        </div>

        {/* Navigation - Filling available space */}
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarGroup className="p-0">
            {!isCollapsed && <SidebarGroupLabel className="font-tech text-racing-yellow px-4 text-[9px] tracking-[0.15em] uppercase mb-1 opacity-70">Hlavní Menu</SidebarGroupLabel>}
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-0.5">
                {visibleMenuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    {item.id === 'settings' ? (
                      <Dialog open={isEventSettingsOpen} onOpenChange={setIsEventSettingsOpen}>
                        <DialogTrigger asChild>
                          <SidebarMenuButton
                            className={`w-full group relative overflow-hidden transition-all duration-200 border border-transparent hover:border-racing-yellow/30 ${activeTab === item.id
                              ? 'bg-racing-yellow text-black font-bold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                              } ${isCollapsed ? 'h-10 justify-center px-0' : 'h-12 px-4 justify-start'}`}
                          >
                            <div className={`flex items-center gap-4 z-10 relative w-full ${isCollapsed ? 'justify-center' : ''}`}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              {!isCollapsed && <span className="font-bebas text-base md:text-xl tracking-wide uppercase pt-0.5">{item.label}</span>}
                              {!isCollapsed && activeTab === item.id && <div className="ml-auto w-1 h-5 bg-black/20"></div>}
                            </div>
                          </SidebarMenuButton>
                        </DialogTrigger>
                        {/* Dialog Content - kept the same */}
                        <DialogContent className="racing-card border-racing-yellow/20 bg-[#0a0a0a] sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="font-bebas text-4xl tracking-wide text-racing-yellow uppercase">Nastavení události</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSaveEventSettings} className="space-y-6 mt-4">
                            <div>
                              <Label htmlFor="eventName" className="text-white/60 font-tech uppercase text-xs tracking-widest pl-1">Název akce</Label>
                              <Input
                                id="eventName"
                                value={eventSettings.eventName}
                                onChange={(e) => setEventSettings(prev => ({ ...prev, eventName: e.target.value }))}
                                className="bg-[#111] border-white/20 text-white focus:border-racing-yellow font-bebas text-xl tracking-wide h-12 mt-1 rounded-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <Label htmlFor="eventDate" className="text-white/60 font-tech uppercase text-xs tracking-widest pl-1">Datum</Label>
                                <Input
                                  id="eventDate"
                                  type="date"
                                  value={eventSettings.eventDate}
                                  onChange={(e) => setEventSettings(prev => ({ ...prev, eventDate: e.target.value }))}
                                  className="bg-[#111] border-white/20 text-white focus:border-racing-yellow font-tech text-sm mt-1 rounded-none"
                                />
                              </div>
                              <div>
                                <Label htmlFor="eventTime" className="text-white/60 font-tech uppercase text-xs tracking-widest pl-1">Čas</Label>
                                <Input
                                  id="eventTime"
                                  type="time"
                                  value={eventSettings.eventTime}
                                  onChange={(e) => setEventSettings(prev => ({ ...prev, eventTime: e.target.value }))}
                                  className="bg-[#111] border-white/20 text-white focus:border-racing-yellow font-tech text-sm mt-1 rounded-none"
                                />
                              </div>
                            </div>
                            <Button type="submit" className="w-full bg-racing-yellow text-black hover:bg-white font-bebas tracking-widest text-xl h-12 uppercase transition-all">
                              Uložit konfiguraci
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <SidebarMenuButton
                        onClick={() => {
                          onTabChange(item.id);
                          if (isMobile) setOpenMobile(false);
                        }}
                        className={`w-full group relative overflow-hidden transition-all duration-200 border border-transparent hover:border-racing-yellow/30 ${activeTab === item.id
                          ? 'bg-racing-yellow text-black font-bold'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                          } ${isCollapsed ? 'h-10 justify-center px-0' : 'h-12 px-4 justify-start'}`}
                      >
                        <div className={`flex items-center gap-4 z-10 relative w-full ${isCollapsed ? 'justify-center' : ''}`}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span className="font-bebas text-base md:text-xl tracking-wide uppercase pt-0.5">{item.label}</span>}
                          {!isCollapsed && activeTab === item.id && <div className="ml-auto w-1 h-5 bg-black/20"></div>}
                        </div>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer Info - Compact */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-white/5">


            <div className="flex items-center justify-between mt-3 px-1">
              <span className="font-tech text-[9px] text-white/20 uppercase">STAV SYSTÉMU: ONLINE</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
});