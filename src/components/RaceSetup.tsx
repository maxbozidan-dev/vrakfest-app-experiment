import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, PlayCircle, Save, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export interface RaceSetupConfig {
  eventName: string;
  location: string;
  eventDate: string;
  raceType: 'rozjizdky' | 'hlavni-zavod' | 'special';
  rounds: number;
  groupMode: 'auto' | 'manual';
  groupSize: number;
  category: 'all' | 'do-16' | 'nad-16' | 'zeny';
  status: 'draft' | 'ready';
  updatedAt: string;
}

const STORAGE_KEY = 'vrakfest-race-setup-v1';

const defaultConfig: RaceSetupConfig = {
  eventName: 'VrakFest Ostrava',
  location: 'Vřesinská strž',
  eventDate: new Date().toISOString().slice(0, 10),
  raceType: 'rozjizdky',
  rounds: 3,
  groupMode: 'auto',
  groupSize: 6,
  category: 'all',
  status: 'draft',
  updatedAt: new Date().toISOString()
};

interface RaceSetupProps {
  onReady?: (config: RaceSetupConfig) => void;
}

export function RaceSetup({ onReady }: RaceSetupProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<RaceSetupConfig>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    try {
      return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {
      return defaultConfig;
    }
  });

  const isValid = useMemo(() => {
    return Boolean(config.eventName.trim()) && Boolean(config.location.trim()) && config.rounds >= 1 && config.groupSize >= 3;
  }, [config]);

  const update = <K extends keyof RaceSetupConfig>(key: K, value: RaceSetupConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const persist = (nextStatus: 'draft' | 'ready') => {
    const next = { ...config, status: nextStatus, updatedAt: new Date().toISOString() };
    setConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const saveDraft = () => {
    persist('draft');
    toast({ title: 'Konfigurace uložena', description: 'Nastavení závodu bylo uloženo jako draft.' });
  };

  const prepareRace = () => {
    if (!isValid) {
      toast({
        title: 'Chybí údaje',
        description: 'Doplň název akce, místo, počet kol a validní velikost skupiny.',
        variant: 'destructive'
      });
      return;
    }

    const readyConfig = persist('ready');
    onReady?.(readyConfig);
    toast({ title: 'Závod připraven', description: 'Krok 1 hotový. Můžeš pokračovat nahráním jezdců.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-racing-yellow">Administrátor • Krok 1</p>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-wider text-white leading-none">Nastavení závodu</h1>
          <p className="text-white/50 text-sm mt-2">Nakonfiguruj akci, parametry jízd a připrav závodní den.</p>
        </div>
        <div className="bg-[#111] border border-white/10 px-4 py-3">
          <p className="font-tech text-[10px] uppercase tracking-widest text-white/40">Stav konfigurace</p>
          <p className={`font-bebas text-2xl tracking-wide ${config.status === 'ready' ? 'text-racing-yellow' : 'text-white'}`}>
            {config.status === 'ready' ? 'PŘIPRAVENO' : 'DRAFT'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#111] border border-white/10 p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Název události</Label>
              <Input value={config.eventName} onChange={(e) => update('eventName', e.target.value)} className="mt-2 bg-black/60 border-white/20" />
            </div>
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Místo</Label>
              <Input value={config.location} onChange={(e) => update('location', e.target.value)} className="mt-2 bg-black/60 border-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Datum</Label>
              <Input type="date" value={config.eventDate} onChange={(e) => update('eventDate', e.target.value)} className="mt-2 bg-black/60 border-white/20" />
            </div>
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Typ závodu</Label>
              <Select value={config.raceType} onValueChange={(v: RaceSetupConfig['raceType']) => update('raceType', v)}>
                <SelectTrigger className="mt-2 bg-black/60 border-white/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rozjizdky">Rozjížďky</SelectItem>
                  <SelectItem value="hlavni-zavod">Hlavní závod</SelectItem>
                  <SelectItem value="special">Speciál / show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Kategorie</Label>
              <Select value={config.category} onValueChange={(v: RaceSetupConfig['category']) => update('category', v)}>
                <SelectTrigger className="mt-2 bg-black/60 border-white/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="do-16">Do 1.6</SelectItem>
                  <SelectItem value="nad-16">Nad 1.6</SelectItem>
                  <SelectItem value="zeny">Ženy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Počet kol</Label>
              <Input type="number" min={1} max={20} value={config.rounds} onChange={(e) => update('rounds', Number(e.target.value || 1))} className="mt-2 bg-black/60 border-white/20" />
            </div>
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Skupiny</Label>
              <Select value={config.groupMode} onValueChange={(v: RaceSetupConfig['groupMode']) => update('groupMode', v)}>
                <SelectTrigger className="mt-2 bg-black/60 border-white/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatický návrh</SelectItem>
                  <SelectItem value="manual">Manuální nastavení</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70 font-tech uppercase text-xs tracking-widest">Jezdců ve skupině</Label>
              <Input type="number" min={3} max={12} value={config.groupSize} onChange={(e) => update('groupSize', Number(e.target.value || 6))} className="mt-2 bg-black/60 border-white/20" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={saveDraft} variant="outline" className="min-h-11">
              <Save className="w-4 h-4" /> Uložit draft
            </Button>
            <Button onClick={prepareRace} className="min-h-11">
              <PlayCircle className="w-4 h-4" /> Připravit závod
            </Button>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 p-5 space-y-4">
          <h3 className="font-bebas text-3xl text-white tracking-wide">Souhrn</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 text-white/70"><CalendarDays className="w-4 h-4 mt-0.5 text-racing-yellow" /><span>{config.eventDate}</span></div>
            <div className="flex items-start gap-2 text-white/70"><MapPin className="w-4 h-4 mt-0.5 text-racing-yellow" /><span>{config.location}</span></div>
            <div className="flex items-start gap-2 text-white/70"><Settings2 className="w-4 h-4 mt-0.5 text-racing-yellow" /><span>{config.rounds} kol • {config.groupSize} jezdců/skupina</span></div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="font-tech text-[10px] uppercase tracking-widest text-white/40">Další krok</p>
            <p className="text-white/70 mt-2 text-sm">Nahraj registrované jezdce do závodu a nech vygenerovat skupiny.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
