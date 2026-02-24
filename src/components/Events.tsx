import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Trophy, Users, Flag, Eye, Award, ArrowLeft, MapPin, FileText } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRacingTournament } from '@/hooks/useRacingTournament';
import { Event, EventType, EVENT_TYPES, EventParticipant } from '@/types/events';
import { Racer } from '@/types/racing';
import { assetUrl } from '@/lib/assetUrl';

export function Events() {
  const { getUpcomingEvents, getPastEvents } = useEvents();
  const { racers } = useRacingTournament();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const FEATURED_EVENT_ID = '2026-1';

  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();

  const getEventTypeLabel = (eventTypes: EventType[]) => {
    return eventTypes.map(type =>
      EVENT_TYPES.find(et => et.value === type)?.label || type
    ).join(' • ');
  };

  const handleViewEventDetails = (event: Event) => {
    if (event.id !== FEATURED_EVENT_ID) return;
    setSelectedEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  const getParticipantByResult = (participants: EventParticipant[], participantId: string) => {
    return participants.find(p => p.id === participantId);
  };

  const getEventRacers = (event: Event): (EventParticipant | Racer)[] => {
    if (event.status === 'upcoming') {
      return racers.filter(racer => racer.isActive);
    } else {
      return event.participants || [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'ledna', 'února', 'března', 'dubna', 'května', 'června',
      'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
    ];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderEventCard = (event: Event, isUpcoming: boolean) => {
    const isDetailed = event.id === FEATURED_EVENT_ID;

    return (
    <div
      key={event.id}
      className={`group relative bg-[#0a0a0a] border border-white/10 overflow-hidden transition-all duration-500 ${isDetailed ? 'hover:border-racing-yellow/40 cursor-pointer' : 'opacity-80 cursor-not-allowed'}`}
      onClick={() => handleViewEventDetails(event)}
    >
      {/* Background Image with Zoom effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={assetUrl(event.imageUrl || '/placeholder.svg')}
          alt={event.name}
          className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
      </div>

      <div className="relative z-10 p-6 flex flex-col h-full min-h-[300px] justify-end">
        <div className="absolute top-6 right-6">
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={isUpcoming ? 'secondary' : 'outline'}
              className={`${isUpcoming
                ? 'bg-racing-yellow text-black'
                : 'border-white/20 text-white/60'
                } font-tech uppercase text-[10px] tracking-widest px-3 py-1`}
            >
              {event.status === 'upcoming' ? 'NÁCHÁZEJÍCÍ' : 'UKONČENO'}
            </Badge>
            <Badge className={`font-tech uppercase text-[10px] tracking-widest px-3 py-1 ${isDetailed ? 'bg-white text-black' : 'bg-white/10 text-white/60 border border-white/20'}`}>
              {isDetailed ? 'DETAIL AKTIVNÍ' : 'DETAIL BRZY'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-racing-yellow">
            <Calendar className="h-4 w-4" />
            <span className="font-tech text-xs tracking-wider uppercase font-bold">{formatDate(event.date)}</span>
          </div>

          <h3 className="font-bebas text-4xl md:text-5xl text-white tracking-widest leading-none">
            {event.name}
          </h3>

          <p className="text-white/60 font-tech text-sm line-clamp-2 max-w-lg mb-4">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-white/40" />
              <span className="text-xs text-white/60 font-tech uppercase tracking-wide">{event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-white/40" />
              <span className="text-xs text-white/60 font-tech uppercase tracking-wide">{event.participantCount} JEZDCŮ</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 text-racing-yellow" />
              <span className="text-xs text-racing-yellow font-tech uppercase tracking-wide">{event.prize || 'TROFEJ'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover visual cue */}
      <div className={`absolute bottom-0 left-0 w-full h-1 ${isDetailed ? 'bg-racing-yellow transform scale-x-0 group-hover:scale-x-100' : 'bg-white/20 scale-x-100'} transition-transform duration-500 origin-left`}></div>
    </div>
  );
  };

  const renderEventDetail = (event: Event) => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden border border-white/10">
        <img
          src={assetUrl(event.imageUrl || '/placeholder.svg')}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>

        <div className="absolute bottom-10 left-6 md:left-12 max-w-3xl">
          <Button
            variant="outline"
            onClick={handleBackToEvents}
            className="mb-8 border-white/20 text-white hover:bg-racing-yellow hover:text-black transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            ZPĚT NA KALENDÁŘ
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-racing-yellow text-black font-tech text-[10px] tracking-widest px-3 py-1 uppercase">
              {event.status === 'upcoming' ? 'V PŘÍPRAVĚ' : 'HISTORIE'}
            </Badge>
            <span className="text-white/40 font-tech text-xs tracking-widest uppercase">/ {getEventTypeLabel(event.eventTypes)}</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bebas text-white tracking-widest leading-none mb-6">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-racing-yellow" />
              <span className="font-tech text-sm text-white uppercase tracking-widest">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-racing-yellow" />
              <span className="font-tech text-sm text-white uppercase tracking-widest">{event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-racing-yellow" />
              <span className="font-tech text-sm text-white uppercase tracking-widest">{event.location || 'OSTRAVA - VŘESINSKÁ STRŽ'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="font-bebas text-4xl text-white tracking-wider flex items-center gap-3">
              <FileText className="h-6 w-6 text-racing-yellow" />
              O UDÁLOSTI
            </h2>
            <p className="text-white/60 font-tech leading-relaxed border-l-2 border-racing-yellow/30 pl-6 py-2">
              {event.description || "Tato událost přinese napínavé souboje, kde se utkají nejlepší jezdci z celého regionu. Přijďte zažít adrenalinovou atmosféru, kde jedinou jistotou je prach a zvuk motorů."}
            </p>
            {event.id === FEATURED_EVENT_ID && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/10 p-4">
                  <p className="font-tech text-[10px] text-white/40 uppercase tracking-widest">Místo</p>
                  <p className="font-bebas text-2xl text-white mt-1">Vřesinská strž, Ostrava</p>
                </div>
                <div className="bg-[#111] border border-white/10 p-4">
                  <p className="font-tech text-[10px] text-white/40 uppercase tracking-widest">Datum</p>
                  <p className="font-bebas text-2xl text-white mt-1">4. dubna 2026</p>
                </div>
                <div className="bg-[#111] border border-white/10 p-4">
                  <p className="font-tech text-[10px] text-white/40 uppercase tracking-widest">Status</p>
                  <p className="font-bebas text-2xl text-racing-yellow mt-1">Registrace otevřena</p>
                </div>
              </div>
            )}
          </section>

          {event.schedule && (
            <section className="space-y-4">
              <h2 className="font-bebas text-4xl text-white tracking-wider flex items-center gap-3">
                <Clock className="h-6 w-6 text-racing-yellow" />
                HARMONOGRAM
              </h2>
              <div className="bg-[#111] border border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.schedule.split('\n').map((line, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2">
                    <span className="font-tech text-racing-yellow text-sm font-bold min-w-[60px]">{line.split(' - ')[0]}</span>
                    <span className="font-tech text-white text-sm uppercase tracking-wider">{line.split(' - ')[1] || line}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Participants - More visual */}
          <section className="space-y-4">
            <h2 className="font-bebas text-4xl text-white tracking-wider flex items-center gap-3">
              <Users className="h-6 w-6 text-racing-yellow" />
              {event.status === 'upcoming' ? 'PŘIHLÁŠENÍ JEZDCI' : 'ÚČASTNÍCI'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {getEventRacers(event).map((racer, idx) => (
                <div key={racer.id} className="bg-[#111] border border-white/5 p-4 group hover:border-racing-yellow/30 transition-all text-center">
                  <div className="w-12 h-12 bg-[#222] border border-white/10 mx-auto flex items-center justify-center font-bebas text-2xl text-racing-yellow mb-2 group-hover:bg-racing-yellow group-hover:text-black transition-colors">
                    {'startNumber' in racer ? racer.startNumber : idx + 1}
                  </div>
                  <div className="font-tech text-[10px] text-white/40 uppercase tracking-widest mb-1">{racer.vehicleType}</div>
                  <div className="font-bebas text-lg text-white group-hover:text-racing-yellow transition-colors">{racer.firstName} {racer.lastName}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Action Card */}
          <div className="bg-racing-yellow p-8">
            <Trophy className="h-12 w-12 text-black mb-6" />
            <h3 className="font-bebas text-4xl text-black mb-4 tracking-wider">ODTÁHNI SI VÍTĚZSTVÍ</h3>
            <p className="text-black/70 font-tech text-sm mb-8 leading-relaxed">
              Hlavní cena pro vítěze této události je stanovena na <span className="font-bold text-black">{event.prize || "Pohár Vrakfestu"}</span>.
              Kdo ovládne Vřesinskou strž tentokrát?
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-black text-white hover:bg-white hover:text-black font-bebas text-xl tracking-widest h-14 uppercase transition-all">
                <a href="https://vrakfest.cz" target="_blank" rel="noreferrer">OFICIÁLNÍ WEB</a>
              </Button>
              <Button variant="outline" asChild className="w-full border-black/30 text-black hover:bg-black hover:text-white font-bebas text-xl tracking-widest h-12 uppercase">
                <a href="https://vrakfest.cz" target="_blank" rel="noreferrer">PROPOZICE A PRAVIDLA</a>
              </Button>
            </div>
          </div>

          {/* Results Summary (if completed) */}
          {event.status === 'completed' && event.results && (
            <div className="bg-[#111] border border-white/5 p-8">
              <h3 className="font-bebas text-3xl text-white mb-6 tracking-wider flex items-center gap-2">
                <Award className="h-6 w-6 text-racing-yellow" />
                VÝSLEDKY TOP 3
              </h3>
              <div className="space-y-6">
                {event.results.slice(0, 3).map((result) => {
                  const participant = getParticipantByResult(event.participants || [], result.participantId);
                  const colors = [
                    'text-racing-yellow', // 1st
                    'text-gray-400',       // 2nd
                    'text-amber-600'       // 3rd
                  ];
                  return (
                    <div key={result.participantId} className="flex items-center gap-4 group">
                      <div className={`font-bebas text-5xl ${colors[result.position - 1] || 'text-white/20'}`}>
                        {result.position}.
                      </div>
                      <div>
                        <div className="font-bebas text-xl text-white group-hover:text-racing-yellow transition-colors">
                          {participant ? `${participant.firstName} ${participant.lastName}` : 'Neznámý'}
                        </div>
                        <div className="font-tech text-[10px] text-white/40 uppercase tracking-widest">
                          {result.points} BODY • {result.time || "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (selectedEvent) {
    return renderEventDetail(selectedEvent);
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-bebas text-7xl md:text-8xl text-white tracking-wider leading-none">
            KALENDÁŘ <span className="racing-gradient-text">AKCÍ</span>
          </h1>
          <p className="text-white/40 font-tech uppercase text-xs tracking-[0.3em] mt-4">
            Kompletní přehled sezóny • Vřesinská strž
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4">
          <div className="text-right">
            <span className="text-white/20 font-tech text-[10px] block uppercase">Celkem akcí</span>
            <span className="font-bebas text-white text-3xl">{upcomingEvents.length + pastEvents.length}</span>
          </div>
          <div className="w-px h-10 bg-white/10 mx-2"></div>
          <div>
            <span className="text-racing-yellow font-tech text-[10px] block uppercase font-bold">Nejbližší</span>
            <span className="font-bebas text-white text-3xl">{upcomingEvents[0]?.name.split(' ')[0] || "---"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Upcoming Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="font-bebas text-4xl text-white tracking-widest shrink-0">NADCHÁZEJÍCÍ UDÁLOSTI</h2>
            <div className="h-px bg-white/10 w-full"></div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => renderEventCard(event, true))
            ) : (
              <div className="bg-[#111] border border-white/5 p-12 text-center col-span-2">
                <Calendar className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-tech uppercase tracking-widest">Momentálně nejsou plánovány žádné akce</p>
              </div>
            )}
          </div>
        </section>

        {/* Past Section */}
        <section className="space-y-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-4">
            <h2 className="font-bebas text-4xl text-white/40 tracking-widest shrink-0 uppercase">HISTORIE ZÁVODŮ</h2>
            <div className="h-px bg-white/5 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => renderEventCard(event, false))
            ) : (
              <p className="text-white/20 font-tech uppercase tracking-widest px-6">První závody na nás teprve čekají</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}