import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Send, MessageSquare, Edit3, Trash2, Settings, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: string;
  originalTimestamp?: Date;
}

interface ChatChannel {
  id: string;
  name: string;
  writePermission: 'everyone' | 'organizers';
  messages: Message[];
}

interface TempChannelSettings {
  name: string;
  writePermission: 'everyone' | 'organizers';
}

interface CommunicationProps {
  role?: 'administrator' | 'jezdec' | 'divak';
}

export function Communication({ role = 'divak' }: CommunicationProps) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<TempChannelSettings>({
    name: 'Komunikační kanál závodu',
    writePermission: 'organizers'
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null);

  // Load channels from localStorage on component mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('communication-channels');
    const savedActiveChannelId = localStorage.getItem('communication-active-channel');
    
    if (savedChannels) {
      const parsedChannels = JSON.parse(savedChannels).map((channel: any) => ({
        ...channel,
        messages: channel.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          originalTimestamp: msg.originalTimestamp ? new Date(msg.originalTimestamp) : undefined
        }))
      }));
      setChannels(parsedChannels);
      
      if (savedActiveChannelId && parsedChannels.find((ch: any) => ch.id === savedActiveChannelId)) {
        setActiveChannelId(savedActiveChannelId);
      } else if (parsedChannels.length > 0) {
        setActiveChannelId(parsedChannels[0].id);
      }
    }
  }, []);

  // Save channels to localStorage whenever channels change
  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('communication-channels', JSON.stringify(channels));
    }
  }, [channels]);

  // Save active channel ID to localStorage whenever it changes
  useEffect(() => {
    if (activeChannelId) {
      localStorage.setItem('communication-active-channel', activeChannelId);
    }
  }, [activeChannelId]);

  const activeChannel = channels.find(ch => ch.id === activeChannelId);
  const canManageChannels = role === 'administrator';
  const canWriteActiveChannel = !!activeChannel && (activeChannel.writePermission === 'everyone' || role === 'administrator');

  const handleCreateChannel = () => {
    const newChannel: ChatChannel = {
      id: Date.now().toString(),
      name: tempSettings.name,
      writePermission: tempSettings.writePermission,
      messages: [{
        id: '1',
        text: `Vítejte v kanálu "${tempSettings.name}"!`,
        timestamp: new Date(),
        sender: 'Organizátor'
      }]
    };
    
    setChannels(prev => [...prev, newChannel]);
    setActiveChannelId(newChannel.id);
    setShowChannelSettings(false);
    setEditingChannelId(null);
    setTempSettings({
      name: 'Komunikační kanál závodu',
      writePermission: 'organizers'
    });
  };

  const handleEditChannel = () => {
    if (editingChannelId) {
      setChannels(prev => 
        prev.map(ch => 
          ch.id === editingChannelId 
            ? { ...ch, name: tempSettings.name, writePermission: tempSettings.writePermission }
            : ch
        )
      );
    }
    setShowChannelSettings(false);
    setEditingChannelId(null);
    setTempSettings({
      name: 'Komunikační kanál závodu',
      writePermission: 'organizers'
    });
  };

  const handleOpenChannelSettings = (channelId?: string) => {
    if (!canManageChannels) return;
    if (channelId) {
      const channel = channels.find(ch => ch.id === channelId);
      if (channel) {
        setEditingChannelId(channelId);
        setTempSettings({
          name: channel.name,
          writePermission: channel.writePermission
        });
      }
    } else {
      setEditingChannelId(null);
      setTempSettings({
        name: 'Komunikační kanál závodu',
        writePermission: 'organizers'
      });
    }
    setShowChannelSettings(true);
  };

  const handleDeleteChannel = (channelId: string) => {
    const updatedChannels = channels.filter(ch => ch.id !== channelId);
    setChannels(updatedChannels);
    
    if (activeChannelId === channelId) {
      const newActiveId = updatedChannels.length > 0 ? updatedChannels[0].id : null;
      setActiveChannelId(newActiveId);
      if (newActiveId) {
        localStorage.setItem('communication-active-channel', newActiveId);
      } else {
        localStorage.removeItem('communication-active-channel');
      }
    }
    
    if (updatedChannels.length === 0) {
      localStorage.removeItem('communication-channels');
    }
    
    setDeleteChannelId(null);
  };

  const handleSendMessage = () => {
    if (!canWriteActiveChannel) return;
    if (newMessage.trim() && activeChannel) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp: new Date(),
        sender: role === 'administrator' ? 'Organizátor' : role === 'jezdec' ? 'Jezdec' : 'Divák'
      };
      
      setChannels(prev => 
        prev.map(ch => 
          ch.id === activeChannelId 
            ? { ...ch, messages: [...ch.messages, message] }
            : ch
        )
      );
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = activeChannel?.messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(messageId);
      setEditText(message.text);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessage && editText.trim() && activeChannel) {
      setChannels(prev => 
        prev.map(ch => 
          ch.id === activeChannelId 
            ? {
                ...ch,
                messages: ch.messages.map(msg => 
                  msg.id === editingMessage 
                    ? { ...msg, text: editText.trim() }
                    : msg
                )
              }
            : ch
        )
      );
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (activeChannel) {
      setChannels(prev => 
        prev.map(ch => 
          ch.id === activeChannelId 
            ? { ...ch, messages: ch.messages.filter(msg => msg.id !== messageId) }
            : ch
        )
      );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Komunikace</h1>
          <p className="text-muted-foreground">Chatovací kanály pro komunikaci během závodu</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <Card className="h-[600px] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Vytvořte první komunikační kanál</h2>
            <p className="text-muted-foreground">Před zahájením komunikace vytvořte a nastavte kanál</p>
            <Button onClick={() => handleOpenChannelSettings()} className="mt-4" disabled={!canManageChannels}>
              <Plus className="h-4 w-4 mr-2" />
              {canManageChannels ? 'Vytvořit kanál' : 'Kanál vytvoří administrátor'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex gap-6 h-[600px]">
          {/* Channel List */}
          <Card className="w-80 flex flex-col">
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Kanály</h3>
              <Button variant="outline" size="sm" onClick={() => handleOpenChannelSettings()} disabled={!canManageChannels}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeChannelId === channel.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary/50 text-foreground'
                    }`}
                    onClick={() => setActiveChannelId(channel.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {channel.writePermission === 'everyone' ? 'Všichni' : 'Organizátoři'}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChannelSettings(channel.id);
                        }}
                        className="w-6 h-6 p-0 hover:bg-primary/20"
                        disabled={!canManageChannels}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteChannelId(channel.id);
                        }}
                        className="w-6 h-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        disabled={!canManageChannels}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col">
            {activeChannel ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{activeChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeChannel.writePermission === 'everyone' ? 'Všichni mohou psát' : 'Pouze organizátoři mohou psát'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenChannelSettings(activeChannel.id)} disabled={!canManageChannels}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeChannel.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className="flex flex-col group hover:bg-secondary/20 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-primary">
                            {message.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.originalTimestamp || message.timestamp)}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMessage(message.id)}
                              className="w-6 h-6 p-0 hover:bg-primary/10"
                              disabled={!canManageChannels}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="w-6 h-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              disabled={!canManageChannels}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-secondary rounded-lg p-3 max-w-[80%]">
                          {editingMessage === message.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <Button size="sm" onClick={handleSaveEdit}>
                                Uložit
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                Zrušit
                              </Button>
                            </div>
                          ) : (
                            <p className="text-foreground whitespace-pre-wrap">{message.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Napište zprávu do ${activeChannel.name}...`}
                      className="flex-1"
                      disabled={!canWriteActiveChannel}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !canWriteActiveChannel}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Vyberte kanál pro začátek komunikace</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Channel Settings Dialog */}
      <Dialog open={showChannelSettings} onOpenChange={setShowChannelSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChannelId ? 'Upravit komunikační kanál' : 'Vytvořit nový komunikační kanál'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-name">Název kanálu</Label>
              <Input
                id="chat-name"
                value={tempSettings.name}
                onChange={(e) => setTempSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Zadejte název kanálu..."
              />
            </div>
            <div className="space-y-2">
              <Label>Oprávnění pro psaní</Label>
              <RadioGroup
                value={tempSettings.writePermission}
                onValueChange={(value: 'everyone' | 'organizers') => 
                  setTempSettings(prev => ({ ...prev, writePermission: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organizers" id="organizers" />
                  <Label htmlFor="organizers">Pouze organizátoři</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Všichni účastníci</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={editingChannelId ? handleEditChannel : handleCreateChannel} 
                className="flex-1"
                disabled={!tempSettings.name.trim()}
              >
                {editingChannelId ? 'Uložit změny' : 'Vytvořit kanál'}
              </Button>
              <Button variant="outline" onClick={() => setShowChannelSettings(false)}>
                Zrušit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Confirmation */}
      <AlertDialog open={!!deleteChannelId} onOpenChange={() => setDeleteChannelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat kanál</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tento komunikační kanál? Všechny zprávy budou trvale ztraceny.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteChannelId && handleDeleteChannel(deleteChannelId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}