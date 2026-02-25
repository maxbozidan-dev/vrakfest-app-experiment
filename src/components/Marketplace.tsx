import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Car, Wrench, Edit, Trash2, Search, Image, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addActionLog } from './ActionLog';
import { assetUrl } from '@/lib/assetUrl';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'offer' | 'demand';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  seller: string;
  contact: string;
}

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onEdit: (item: MarketplaceItem) => void;
  onDelete: (id: string) => void;
  canModerate?: boolean;
}

function MarketplaceCard({ item, onEdit, onDelete, canModerate = false }: MarketplaceItemCardProps) {
  return (
    <Card className="racing-card overflow-hidden group hover:border-racing-yellow/30 transition-all duration-300">
      {/* Hero Image Area */}
      <div className="relative h-56 overflow-hidden">
        {item.images.length > 0 ? (
          <img
            src={assetUrl(item.images[0])}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[#151515] flex items-center justify-center">
            <Image className="w-12 h-12 text-white/10" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className={`${item.type === 'offer' ? 'bg-green-600/90' : 'bg-blue-600/90'} backdrop-blur-md border-none font-tech text-[10px] tracking-widest px-3 py-1`}>
            {item.type === 'offer' ? 'NABÍDKA' : 'POPTÁVKA'}
          </Badge>
          <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/10 font-tech text-[10px] text-white/70 uppercase">
            {item.category}
          </Badge>
        </div>

        {/* Action Buttons Overlay */}
        {canModerate && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="w-8 h-8 rounded-none bg-black/80 hover:bg-racing-yellow hover:text-black border border-white/10" onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" className="w-8 h-8 rounded-none bg-red-600/80 hover:bg-red-600 border border-white/10" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Price Tag Overlay */}
        {item.price > 0 && (
          <div className="absolute bottom-0 right-0 bg-racing-yellow px-4 py-2 skew-x-[-12deg] translate-x-2">
            <span className="font-bebas text-2xl text-black inline-block skew-x-[12deg]">
              {item.price.toLocaleString()} Kč
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bebas text-2xl text-white group-hover:text-racing-yellow transition-colors truncate">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1 h-3 bg-racing-yellow"></div>
            <p className="font-tech text-[10px] text-white/40 uppercase tracking-widest">{item.seller}</p>
          </div>
        </div>

        <p className="text-white/60 text-sm line-clamp-2 min-h-[40px] leading-relaxed">
          {item.description}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-racing-yellow/80">
            <Wrench className="w-4 h-4" />
            <span className="font-bebas text-lg tracking-wider">{item.contact}</span>
          </div>
          <span className="text-[10px] font-tech text-white/20 uppercase tracking-tighter">
            {item.createdAt.toLocaleDateString('cs-CZ')}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

interface MarketplaceProps {
  canModerate?: boolean;
}

export function Marketplace({ canModerate = false }: MarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Auta', createdAt: new Date() },
    { id: '2', name: 'Náhradní díly', createdAt: new Date() }
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'offer' | 'demand'>('all');
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    type: 'offer' as 'offer' | 'demand',
    seller: '',
    contact: '',
    images: [] as File[]
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('marketplace-items');
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      setItems(parsedItems);
    } else {
      // Mock Demo Data
      const demoItems: MarketplaceItem[] = [
        {
          id: 'demo-1',
          title: 'Škoda Felicia 1.3 - Kompletní vrak',
          description: 'Auto připravené na derby. Vyndaná skla, vyvařený rám v ceně. Motor šlape. Nutno odvézt na podvalu.',
          price: 4500,
          category: 'Auta',
          type: 'offer',
          images: ['/m-felicia.png'],
          createdAt: new Date(),
          updatedAt: new Date(),
          seller: 'Patrik K.',
          contact: '722 123 456'
        },
        {
          id: 'demo-2',
          title: 'Sada drapáků (bahňáky) - 4ks',
          description: 'Pneu s vysokým vzorkem na Felicii/Favorit. Skvělá trakce v blátě. Málo jeté jednu sezónu.',
          price: 1200,
          category: 'Náhradní díly',
          type: 'offer',
          images: ['/m-pneu.png'],
          createdAt: new Date(),
          updatedAt: new Date(),
          seller: 'Martin Č.',
          contact: '603 888 999'
        },
        {
          id: 'demo-3',
          title: 'Motor 1.6 MPi 55kW',
          description: 'Motor po výměně oleje, připraven do akce. Stačí nahodit a jet. Ideální na nad 1.6 kategorii.',
          price: 3500,
          category: 'Náhradní díly',
          type: 'offer',
          images: ['/m-motor.png'],
          createdAt: new Date(),
          updatedAt: new Date(),
          seller: 'Jiří F.',
          contact: '777 555 333'
        }
      ];
      setItems(demoItems);
      localStorage.setItem('marketplace-items', JSON.stringify(demoItems));
    }

    const savedCategories = localStorage.getItem('marketplace-categories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories).map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt)
      }));
      setCategories(parsedCategories);
    }
  }, []);

  const saveItems = (newItems: MarketplaceItem[]) => {
    localStorage.setItem('marketplace-items', JSON.stringify(newItems));
    setItems(newItems);
  };

  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem('marketplace-categories', JSON.stringify(newCategories));
    setCategories(newCategories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.seller || !formData.contact) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna povinná pole.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const imageUrls = formData.images.map(file => URL.createObjectURL(file));

    if (editingItem) {
      const updatedItem: MarketplaceItem = {
        ...editingItem,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        type: formData.type,
        seller: formData.seller,
        contact: formData.contact,
        images: imageUrls.length > 0 ? imageUrls : editingItem.images,
        updatedAt: now
      };

      const updatedItems = items.map(item => item.id === editingItem.id ? updatedItem : item);
      saveItems(updatedItems);

      addActionLog(
        formData.seller,
        formData.contact,
        `Upravil inzerát: ${formData.title}`,
        'marketplace',
        `Kategorie: ${formData.category}, Typ: ${formData.type === 'offer' ? 'Nabídka' : 'Poptávka'}`
      );

      toast({ title: "Inzerát upraven", description: "Inzerát byl úspěšně aktualizován." });
    } else {
      const newItem: MarketplaceItem = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        type: formData.type,
        images: imageUrls,
        createdAt: now,
        updatedAt: now,
        seller: formData.seller,
        contact: formData.contact
      };

      saveItems([...items, newItem]);

      addActionLog(
        formData.seller,
        formData.contact,
        `Přidal nový inzerát: ${formData.title}`,
        'marketplace',
        `Kategorie: ${formData.category}, Typ: ${formData.type === 'offer' ? 'Nabídka' : 'Poptávka'}`
      );

      toast({ title: "Inzerát přidán", description: "Nový inzerát byl úspěšně vytvořen." });
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      type: 'offer',
      seller: '',
      contact: '',
      images: []
    });
  };

  const handleEdit = (item: MarketplaceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      type: item.type,
      seller: item.seller,
      contact: item.contact,
      images: []
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const item = items.find(i => i.id === id);
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);

    if (item) {
      addActionLog(
        item.seller,
        item.contact,
        `Smazal inzerát: ${item.title}`,
        'marketplace'
      );
    }

    toast({ title: "Inzerát smazán", description: "Inzerát byl úspěšně odstraněn." });
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Chyba",
        description: "Zadejte název kategorie.",
        variant: "destructive",
      });
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory,
      createdAt: new Date()
    };

    saveCategories([...categories, category]);
    setNewCategory('');
    setIsCategoryDialogOpen(false);

    addActionLog(
      'Administrátor',
      'admin@vrakfest.cz',
      `Přidal novou kategorii: ${newCategory}`,
      'marketplace'
    );

    toast({ title: "Kategorie přidána", description: "Nová kategorie byla úspěšně vytvořena." });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold racing-gradient-text">Obchod</h1>
        <div className="flex gap-2">
          {canModerate && (
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Kategorie
                </Button>
              </DialogTrigger>
              <DialogContent className="racing-card">
                <DialogHeader>
                  <DialogTitle className="racing-gradient-text">Přidat kategorii</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newCategory">Název kategorie</Label>
                    <Input
                      id="newCategory"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="racing-input"
                      placeholder="Zadejte název kategorie..."
                    />
                  </div>
                  <Button onClick={addCategory} className="racing-btn-primary">
                    Přidat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="racing-btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Přidat inzerát
              </Button>
            </DialogTrigger>
            <DialogContent className="racing-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="racing-gradient-text">
                  {editingItem ? 'Upravit inzerát' : 'Nový inzerát'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Název položky *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="racing-input"
                      placeholder="Zadejte název..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Cena (Kč)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="racing-input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte kategorii" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Typ *</Label>
                    <Select value={formData.type} onValueChange={(value: 'offer' | 'demand') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offer">Nabídka</SelectItem>
                        <SelectItem value="demand">Poptávka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Popis položky *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="racing-input"
                    placeholder="Podrobně popište položku..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seller">Jméno *</Label>
                    <Input
                      id="seller"
                      value={formData.seller}
                      onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                      className="racing-input"
                      placeholder="Vaše jméno..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Kontakt *</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="racing-input"
                      placeholder="Email nebo telefon..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="images">Fotky</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files || []) })}
                    className="racing-input"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); setEditingItem(null); }}>
                    Zrušit
                  </Button>
                  <Button type="submit" className="racing-btn-primary">
                    {editingItem ? 'Aktualizovat' : 'Přidat'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="racing-card p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Hledat v inzerátech..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 racing-input"
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny kategorie</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value: 'all' | 'offer' | 'demand') => setTypeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vše</SelectItem>
              <SelectItem value="offer">Nabídka</SelectItem>
              <SelectItem value="demand">Poptávka</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="racing-card">
          <TabsTrigger value="all">Vše ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="offer">Nabídky ({filteredItems.filter(i => i.type === 'offer').length})</TabsTrigger>
          <TabsTrigger value="demand">Poptávky ({filteredItems.filter(i => i.type === 'demand').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-white/5 border border-dashed border-white/10">
                <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bebas tracking-widest text-white/40">ŽÁDNÉ INZERÁTY NENALEZENY</p>
                <p className="text-white/20 text-sm mt-2 font-tech uppercase">Zkuste upravit filtry vyhledávání</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <MarketplaceCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canModerate={canModerate}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="offer">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.filter(item => item.type === 'offer').map((item) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canModerate={canModerate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demand">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.filter(item => item.type === 'demand').map((item) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canModerate={canModerate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}