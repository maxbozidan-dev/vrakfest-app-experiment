import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, ThumbsUp, Medal, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assetUrl } from '@/lib/assetUrl';
import { UserRole } from '@/types/roles';

interface PollOption {
    id: string;
    name: string;
    vehicle: string;
    image: string;
    votes: number;
    racerId?: string;
}

interface Poll {
    id: string;
    title: string;
    description: string;
    endTime: string;
    options: PollOption[];
}

const mockPolls: Poll[] = [
    {
        id: 'wreck-of-the-day',
        title: 'VRAK DNE - OSTRAVA 2025',
        description: 'Hlasujte pro nejvíce zdecimované auto, které se stále hýbe na trati!',
        endTime: '15:30',
        options: [
            { id: '1', name: 'Patrik Klepáč', vehicle: 'Škoda Felicia', image: '/vrak-1.png', votes: 142 },
            { id: '2', name: 'Martin Červenka', vehicle: 'Peugeot 206', image: '/vrak-2.png', votes: 89 },
            { id: '3', name: 'Petr Bija', vehicle: 'VW Golf', image: '/vrak-3.png', votes: 124 },
        ]
    },
    {
        id: 'best-hit',
        title: 'NEJLEPŠÍ BOUDA',
        description: 'Kdo předvedl nejagresivnější a nejčistší zásah v tomto kole?',
        endTime: '16:00',
        options: [
            { id: '4', name: 'Jiří Feix', vehicle: 'Fabie', image: '/vrak-2.png', votes: 45 },
            { id: '5', name: 'Daniel Bezděk', vehicle: 'Renault Clio', image: '/vrak-1.png', votes: 67 },
        ]
    }
];

interface VotingProps {
    role?: UserRole;
    currentRacerName?: string;
}

export function Voting({ role = 'divak', currentRacerName }: VotingProps) {
    const [polls, setPolls] = useState<Poll[]>(mockPolls);
    const [votedPolls, setVotedPolls] = useState<string[]>([]);
    const { toast } = useToast();

    const handleVote = (pollId: string, optionId: string) => {
        if (role === 'administrator') {
            toast({
                title: 'Admin mód',
                description: 'Administrátor nemůže hlasovat, jen spravuje ankety.',
                variant: 'destructive'
            });
            return;
        }

        if (votedPolls.includes(pollId)) {
            toast({
                title: "Už jste hlasovali",
                description: "V této anketě můžete hlasovat pouze jednou.",
                variant: "destructive"
            });
            return;
        }

        const poll = polls.find(p => p.id === pollId);
        const option = poll?.options.find(o => o.id === optionId);
        if (role === 'jezdec' && currentRacerName && option?.name === currentRacerName) {
            toast({
                title: 'Neplatná akce',
                description: 'Jezdec nemůže hlasovat sám pro sebe.',
                variant: 'destructive'
            });
            return;
        }

        setPolls(prev => prev.map(poll => {
            if (poll.id === pollId) {
                return {
                    ...poll,
                    options: poll.options.map(opt =>
                        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                    )
                };
            }
            return poll;
        }));

        setVotedPolls(prev => [...prev, pollId]);
        toast({
            title: "Hlas odeslán",
            description: "Děkujeme za váš hlas v anketě!",
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="font-bebas text-5xl text-white tracking-wide uppercase leading-none">Hlasování diváků</h2>
                    <p className="text-white/40 font-tech uppercase text-xs tracking-[0.2em] mt-2">Rozhodněte o vítězích speciálních kategorií</p>
                </div>
                <div className="flex items-center gap-3 bg-racing-yellow/10 border border-racing-yellow/20 px-4 py-2">
                    <Flame className="w-5 h-5 text-racing-yellow animate-pulse" />
                    <span className="font-tech text-racing-yellow text-xs uppercase tracking-widest font-bold">Aktivní hlasování</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {polls.map((poll) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const hasVoted = votedPolls.includes(poll.id);

                    return (
                        <div key={poll.id} className="space-y-6">
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bebas text-3xl text-racing-yellow tracking-wider">{poll.title}</h3>
                                    <p className="text-white/60 text-sm max-w-xl">{poll.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-white/20 font-tech text-[10px] block uppercase">Končí v</span>
                                    <span className="font-bebas text-white text-2xl">{poll.endTime}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {poll.options.map((option) => {
                                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                                    return (
                                        <Card
                                            key={option.id}
                                            className={`bg-[#0a0a0a] border-white/5 overflow-hidden group transition-all duration-300 ${hasVoted ? 'opacity-90' : 'hover:border-racing-yellow/40'
                                                }`}
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={assetUrl(option.image)}
                                                    alt={option.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2 py-1 border border-white/10">
                                                    <span className="font-tech text-white text-[10px] uppercase">{option.votes} HLASŮ</span>
                                                </div>
                                            </div>

                                            <CardContent className="p-5 space-y-4">
                                                <div>
                                                    <h4 className="font-bebas text-2xl text-white group-hover:text-racing-yellow transition-colors">{option.name}</h4>
                                                    <p className="font-tech text-[10px] text-white/40 uppercase tracking-widest">{option.vehicle}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-tech text-white/60 uppercase">
                                                        <span>Průběžný stav</span>
                                                        <span className="text-white">{Math.round(percentage)}%</span>
                                                    </div>
                                                    <Progress value={percentage} className="h-1.5 bg-white/5" indicatorClassName="bg-racing-yellow" />
                                                </div>

                                                <Button
                                                    onClick={() => handleVote(poll.id, option.id)}
                                                    disabled={hasVoted || role === 'administrator'}
                                                    className={`w-full font-bebas tracking-widest text-lg py-6 transition-all duration-300 ${(hasVoted || role === 'administrator')
                                                        ? 'bg-white/5 text-white/20 border-white/5'
                                                        : 'bg-racing-yellow text-black hover:bg-white border-none shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                                                        }`}
                                                >
                                                    {role === 'administrator' ? 'SPRÁVA ANKET' : hasVoted ? 'ODHLASOVÁNO' : (
                                                        <span className="flex items-center gap-2">
                                                            <ThumbsUp className="w-4 h-4" />
                                                            HLASOVAT
                                                        </span>
                                                    )}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rewards Section */}
            <div className="mt-16 bg-racing-yellow p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 rotate-12 -translate-y-4 translate-x-4">
                    <Trophy className="w-64 h-64 text-black" />
                </div>
                <div className="bg-black p-4 shrink-0 shadow-2xl relative z-10">
                    <Medal className="w-12 h-12 text-racing-yellow" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="font-bebas text-4xl text-black mb-2 tracking-wide uppercase">Odměna pro hlasující</h3>
                    <p className="text-black/70 font-tech text-sm max-w-2xl leading-relaxed">
                        Hlasováním v anketách se automaticky zapojujete do losování o oficiální merch Vrakfestu a VIP vstupy na příští sezónu. Vítězové budou vyhlášeni v 17:00 na hlavní tribuně!
                    </p>
                </div>
                <div className="ml-auto relative z-10">
                    <div className="bg-black/20 border border-black/10 px-6 py-3">
                        <span className="font-bebas text-black text-2xl tracking-widest">LOYALTY PROGRAM v3.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
