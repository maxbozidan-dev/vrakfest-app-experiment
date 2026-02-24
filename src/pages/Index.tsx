import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { BarChart3, Activity, ShoppingCart, User, BookOpen, Calendar, MessageSquare, Timer, Wifi, Zap } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardActions } from '@/components/DashboardActions';
import { DashboardStats } from '@/components/DashboardStats';
import { RacerTable } from '@/components/RacerTable';
import { RacerForm } from '@/components/RacerForm';
import { TournamentBracket } from '@/components/TournamentBracket';
import { RaceControl } from '@/components/RaceControl';
import { RacerOverview } from '@/components/RacerOverview';
import { Statistics } from '@/components/Statistics';
import { Events } from '@/components/Events';
import { Communication } from '@/components/Communication';
import { Voting } from '@/components/Voting';
import { RaceRules } from '@/components/RaceRules';
import { ActionLog } from '@/components/ActionLog';
import { Marketplace } from '@/components/Marketplace';
import { BannerSlideshow } from '@/components/BannerSlideshow';
import { EventCountdown } from '@/components/EventCountdown';
import { useRacingTournament } from '@/hooks/useRacingTournament';
import { Racer } from '@/types/racing';
import { TournamentSettings, defaultTournamentSettings } from '@/types/tournamentSettings';

// Static data outside component to avoid re-allocation
const GRID_BOXES = [
  {
    id: 'bodove-poradei',
    icon: BarChart3,
    title: 'LIVE TIMING',
    desc: 'Sleduj body a časy všech závodníků online v reálném čase.'
  },
  {
    id: 'hlasovani',
    icon: Activity,
    title: 'HLASOVÁNÍ',
    desc: 'Rozhoduj o nejlepším vraku dne a vyhrávej ceny od sponzorů.'
  },
  {
    id: 'bazar',
    icon: ShoppingCart,
    title: 'MARKETPLACE',
    desc: 'Přístup k limitovaným nabídkám náhradních dílů přímo od jezdců.'
  },
  {
    id: 'statistiky',
    icon: User,
    title: 'PROFILY JEZDCŮ',
    desc: 'Kompletní statistiky, historie bouraček a týmové info na jednom místě.'
  },
  {
    id: 'pravidla',
    icon: BookOpen,
    title: 'PRODEJ MERCHE',
    desc: 'Oficiální Vrakfest trička, mikiny a doplňky přímo v aplikaci.'
  },
  {
    id: 'udalosti',
    icon: Calendar,
    title: 'KALENDÁŘ AKCÍ',
    desc: 'Interaktivní mapa a harmonogram všech plánovaných závodů v sezóně.'
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('jezdci');
  const [isPending, startTransition] = useTransition();
  const [editingRacer, setEditingRacer] = useState<Racer | null>(null);

  const {
    racers,
    tournament,
    tournamentSettings,
    demolitionDerbyRacers,
    addRacer,
    updateRacer,
    deleteRacer,
    deactivateRacer,
    activateRacer,
    startTournament,
    startRace,
    completeRace,
    resetTournament,
    getCurrentRaceGroup,
    addRacersToGroup,
    addToDemolitionDerby,
    removeFromDemolitionDerby,
    updateTournamentSettings
  } = useRacingTournament();

  // Memoize derived data
  const activeRacers = useMemo(() => racers.filter(r => r.isActive), [racers]);
  const currentRaceGroup = useMemo(() => getCurrentRaceGroup(), [getCurrentRaceGroup]);

  // Listen for redirect to tournament event
  useEffect(() => {
    const handleRedirect = () => {
      setActiveTab('turnaj');
    };

    window.addEventListener('redirectToTournament', handleRedirect);
    return () => window.removeEventListener('redirectToTournament', handleRedirect);
  }, []);

  const handleEditRacer = (racer: Racer) => {
    setEditingRacer(racer);
  };

  const handleSaveRacer = (racerData: Omit<Racer, 'id'>) => {
    if (editingRacer) {
      updateRacer(editingRacer.id, racerData);
      setEditingRacer(null);
    } else {
      addRacer(racerData);
    }
  };

  const handleCancelEdit = () => {
    setEditingRacer(null);
  };

  const handleViewTournament = () => {
    setActiveTab('turnaj');
  };

  const handleStartTournament = () => {
    setActiveTab('turnaj');
    startTournament(tournamentSettings || defaultTournamentSettings);
  };

  const handleSettingsChange = (settings: TournamentSettings) => {
    updateTournamentSettings(settings);
  };

  const handleViewControl = () => {
    setActiveTab('kontrola');
  };

  const handleViewCommunication = () => {
    setActiveTab('komunikace');
  };

  const handleViewStatistics = () => {
    setActiveTab('bodove-poradei');
  };

  const handleViewMarketplace = () => {
    setActiveTab('bazar');
  };

  const handleAddRacerToTournament = (racerId: string) => {
    activateRacer(racerId);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'jezdci':
        return (
          <div className="space-y-6 md:space-y-10">
            {/* Mobile HUD - game style */}
            <div className="md:hidden space-y-3">
              <div className="bg-[#111] border border-racing-yellow/40 p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(244,206,20,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(244,206,20,0.06)_1px,transparent_1px)] bg-[size:18px_18px] opacity-40" />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-tech text-[10px] tracking-[0.18em] uppercase text-racing-yellow">Mobilní panel jezdce</p>
                    <p className="font-bebas text-3xl leading-none tracking-wider text-white">RACE HUD</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 border border-racing-yellow/40 bg-racing-yellow/10">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-tech text-[9px] uppercase tracking-widest text-racing-yellow">ONLINE</span>
                  </div>
                </div>
                <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
                  <div className="bg-black/50 border border-white/10 p-2">
                    <div className="flex items-center gap-1 text-white/50"><User className="w-3 h-3" /><span className="text-[9px] font-tech uppercase">Aktivní</span></div>
                    <p className="font-bebas text-2xl text-white leading-none mt-1">{activeRacers.length}</p>
                  </div>
                  <div className="bg-black/50 border border-white/10 p-2">
                    <div className="flex items-center gap-1 text-white/50"><Timer className="w-3 h-3" /><span className="text-[9px] font-tech uppercase">Kolo</span></div>
                    <p className="font-bebas text-2xl text-racing-yellow leading-none mt-1">{tournament?.currentRound || 0}</p>
                  </div>
                  <div className="bg-black/50 border border-white/10 p-2">
                    <div className="flex items-center gap-1 text-white/50"><Wifi className="w-3 h-3" /><span className="text-[9px] font-tech uppercase">Systém</span></div>
                    <p className="font-bebas text-2xl text-white leading-none mt-1">OK</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'turnaj', label: 'Program', icon: Calendar },
                  { id: 'bodove-poradei', label: 'Body', icon: BarChart3 },
                  { id: 'hlasovani', label: 'Hlasování', icon: Zap },
                  { id: 'bazar', label: 'Bazar', icon: ShoppingCart },
                ].map((quick) => (
                  <button
                    key={quick.id}
                    onClick={() => handleTabChange(quick.id)}
                    className="bg-[#111] border border-white/10 active:border-racing-yellow/60 p-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-racing-yellow"><quick.icon className="w-4 h-4" /><span className="font-tech text-[10px] uppercase tracking-widest">Quick</span></div>
                    <p className="font-bebas text-2xl text-white leading-none mt-1 tracking-wide">{quick.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <BannerSlideshow />

            <DashboardStats
              racerCount={racers.length}
              activeRacerCount={activeRacers.length}
              tournamentProgress={tournament?.currentRound || 0}
            />

            <EventCountdown />

            {/* Driver Focused Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {GRID_BOXES.map((box) => (
                <div
                  key={box.id}
                  className="bg-[#111] border border-white/5 p-4 md:p-6 cursor-pointer group hover:border-racing-yellow/30 transition-all relative overflow-hidden"
                  onClick={() => handleTabChange(box.id)}
                >
                  <div className="flex items-start gap-4 md:gap-5 relative z-10">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#222] flex items-center justify-center border border-white/10 group-hover:border-racing-yellow/30 transition-colors flex-shrink-0">
                      <box.icon className="w-6 h-6 md:w-7 md:h-7 text-racing-yellow" />
                    </div>
                    <div>
                      <h3 className="font-bebas text-2xl md:text-3xl text-white mb-1 tracking-wider">{box.title}</h3>
                      <p className="text-white/40 text-xs md:text-sm font-tech leading-relaxed">{box.desc}</p>
                    </div>
                  </div>
                  {/* Subtle Background Glow */}
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-racing-yellow/5 rounded-full blur-2xl group-hover:bg-racing-yellow/10 transition-all"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'turnaj':
        return (
          <TournamentBracket
            tournament={tournament}
            racers={racers}
            onStartRace={startRace}
            onStartTournament={handleStartTournament}
            tournamentSettings={tournamentSettings || defaultTournamentSettings}
            onSettingsChange={handleSettingsChange}
            onAddRacersToGroup={addRacersToGroup}
            onSwitchToControl={handleViewControl}
            onAddRacerToTournament={handleAddRacerToTournament}
            viewOnly={true} // New prop for driver view
          />
        );

      case 'kontrola':
        return (
          <RaceControl
            currentGroup={currentRaceGroup}
            onCompleteRace={completeRace}
          />
        );

      case 'bodove-poradei':
        return (
          <Statistics
            racers={racers}
            tournament={tournament}
          />
        );

      case 'statistiky':
        return (
          <RacerOverview
            racers={racers}
            demolitionDerbyRacers={demolitionDerbyRacers}
            onEdit={handleEditRacer}
            onDelete={deleteRacer}
            onDeactivate={deactivateRacer}
            onActivate={activateRacer}
            onAddToDemolitionDerby={addToDemolitionDerby}
            onRemoveFromDemolitionDerby={removeFromDemolitionDerby}
            onSave={handleSaveRacer}
            onCancel={handleCancelEdit}
            editingRacer={editingRacer}
          />
        );

      case 'udalosti':
        return <Events />;

      case 'komunikace':
        return <Communication />;

      case 'pravidla':
        return <RaceRules />;

      case 'log-akci':
        return <ActionLog />;

      case 'bazar':
        return <Marketplace />;

      case 'hlasovani':
        return <Voting />;

      default:
        return null;
    }
  };

  const handleTabChange = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={`min-h-[100dvh] w-full flex bg-[#050505] text-white overflow-x-hidden relative selection:bg-racing-yellow selection:text-black ${isPending ? 'opacity-80' : ''}`}>

        {/* Global Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-racing-yellow/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[150px]"></div>
        </div>

        {/* Sidebar stays fixed because of the outer h-screen overflow-hidden */}
        <AppSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 overflow-hidden">
          <DashboardHeader
            activeRacerCount={activeRacers.length}
            racerCount={racers.length}
            onReset={resetTournament}
            currentInfo={tournament.isActive ? "PŘÍŠTÍ ZÁVOD ZA 15 MIN" : "PŘIPRAVUJEME DALŠÍ AKCI"}
          />

          <main className="flex-1 overflow-y-auto px-3 pb-3 pt-2 md:p-8 lg:p-10 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto pb-20">
              {/* Content Container - Reduced duration and added key for smoother re-triggering of animations */}
              <div
                key={activeTab}
                className="relative animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
              >
                {renderMainContent()}
              </div>
            </div>
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
};

export default Index;