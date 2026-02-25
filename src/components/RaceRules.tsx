import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bold, Italic, Underline, Type, Edit3, Save, Eye,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, Palette, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RuleBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list' | 'ordered-list';
  content: string;
  style: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string;
    fontSize: 'small' | 'medium' | 'large' | 'x-large';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    backgroundColor?: string;
  };
}

interface RaceRulesProps {
  canEdit?: boolean;
}

export function RaceRules({ canEdit = false }: RaceRulesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rules, setRules] = useState<RuleBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedRules = localStorage.getItem('race-rules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      // Default rules
      setRules([
        {
          id: '1',
          type: 'h1',
          content: 'Pravidla závodu VrakFest',
          style: { bold: true, italic: false, underline: false, color: '#FFD700', fontSize: 'x-large', textAlign: 'center' }
        },
        {
          id: '2',
          type: 'h2',
          content: 'Obecná pravidla a podmínky účasti',
          style: { bold: true, italic: false, underline: false, color: '#FFFFFF', fontSize: 'large', textAlign: 'left' }
        },
        {
          id: '3',
          type: 'paragraph',
          content: '• Každý účastník musí být starší 18 let a vlastnit platný řidičský průkaz.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '4',
          type: 'paragraph',
          content: '• Narážení do dveří řidiče je přísně zakázáno a trestá se okamžitou diskvalifikací. Dveře řidiče musí být označeny výrazným křížem (X).',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '5',
          type: 'paragraph',
          content: '• Závodník musí mít helmu, pevné boty, dlouhé kalhoty a reflexní vestu. Doporučuje se nehořlavé oblečení.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '6',
          type: 'h2',
          content: 'Technické podmínky vozidel',
          style: { bold: true, italic: false, underline: false, color: '#FFFFFF', fontSize: 'large', textAlign: 'left' }
        },
        {
          id: '7',
          type: 'paragraph',
          content: '• Do závodu jsou připuštěna vozinka do výšky VW Sharan. Větší vozy musí být sníženy úpravou podvozku.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '8',
          type: 'paragraph',
          content: '• Z chladicího systému musí být vypuštěn fridex a nahrazen čistou vodou z ekologických důvodů.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '9',
          type: 'paragraph',
          content: '• Je přísně zakázáno vyztužovat karoserii betonem. Výztuhy kolejnicemi nebo ráfky jsou povoleny mimo kategorii Hobby.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        },
        {
          id: '10',
          type: 'paragraph',
          content: '• Vozidla na plyn (LPG/CNG) se závodu nesmí účastnit.',
          style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
        }
      ]);
    }
  }, []);

  const saveRules = () => {
    localStorage.setItem('race-rules', JSON.stringify(rules));
    setIsEditing(false);
    toast({
      title: "Pravidla uložena",
      description: "Pravidla závodu byla úspěšně aktualizována.",
    });
  };

  const addNewBlock = () => {
    const newBlock: RuleBlock = {
      id: Date.now().toString(),
      type: 'paragraph',
      content: 'Nový text...',
      style: { bold: false, italic: false, underline: false, color: '#FFFFFF', fontSize: 'medium', textAlign: 'left' }
    };
    setRules([...rules, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<RuleBlock>) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
  };

  const updateBlockStyle = (id: string, styleUpdates: Partial<RuleBlock['style']>) => {
    setRules(rules.map(rule =>
      rule.id === id
        ? { ...rule, style: { ...rule.style, ...styleUpdates } }
        : rule
    ));
  };

  const deleteBlock = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const getBlockStyles = (block: RuleBlock) => {
    const baseStyles = "transition-all duration-200 px-2 py-1";
    const sizeStyles = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
      'x-large': "text-xl"
    };

    const alignStyles = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify"
    };

    return `${baseStyles} ${sizeStyles[block.style.fontSize]} ${alignStyles[block.style.textAlign]} ${block.style.bold ? 'font-bold' : 'font-normal'
      } ${block.style.italic ? 'italic' : ''
      } ${block.style.underline ? 'underline' : ''
      }`;
  };

  const getHeadingStyles = (type: string) => {
    switch (type) {
      case 'h1': return "text-3xl font-bold mb-6 mt-4";
      case 'h2': return "text-2xl font-semibold mb-4 mt-3";
      case 'h3': return "text-xl font-medium mb-3 mt-2";
      case 'list': return "mb-2 ml-4 list-disc";
      case 'ordered-list': return "mb-2 ml-4 list-decimal";
      default: return "mb-3 leading-relaxed";
    }
  };

  const selectedBlock = selectedBlockId ? rules.find(r => r.id === selectedBlockId) : null;

  useEffect(() => {
    if (!canEdit && isEditing) {
      setIsEditing(false);
    }
  }, [canEdit, isEditing]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Editor článků</h1>
        </div>
        <Button
          onClick={isEditing ? saveRules : () => setIsEditing(true)}
          className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
          disabled={!canEdit && !isEditing}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Uložit dokument
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 mr-2" />
              {canEdit ? 'Upravit dokument' : 'Pouze pro čtení'}
            </>
          )}
        </Button>
      </div>

      {/* Word-like Toolbar */}
      {isEditing && (
        <div className="bg-card border-b">
          {/* Main toolbar */}
          <div className="p-3 space-y-3">
            {/* Top row - Basic actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={addNewBlock}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Type className="w-4 h-4" />
                Nový blok
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {selectedBlock && (
                <>
                  <Select
                    value={selectedBlock.type}
                    onValueChange={(value: RuleBlock['type']) =>
                      updateBlock(selectedBlockId!, { type: value })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">Nadpis 1</SelectItem>
                      <SelectItem value="h2">Nadpis 2</SelectItem>
                      <SelectItem value="h3">Nadpis 3</SelectItem>
                      <SelectItem value="paragraph">Normální text</SelectItem>
                      <SelectItem value="list">Seznam</SelectItem>
                      <SelectItem value="ordered-list">Číslovaný seznam</SelectItem>
                    </SelectContent>
                  </Select>

                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
            </div>

            {/* Bottom row - Formatting controls */}
            {selectedBlock && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Font formatting */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedBlock.style.bold ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, {
                      bold: !selectedBlock.style.bold
                    })}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBlock.style.italic ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, {
                      italic: !selectedBlock.style.italic
                    })}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBlock.style.underline ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, {
                      underline: !selectedBlock.style.underline
                    })}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Font size */}
                <Select
                  value={selectedBlock.style.fontSize}
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'x-large') =>
                    updateBlockStyle(selectedBlockId!, { fontSize: value })
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">10pt</SelectItem>
                    <SelectItem value="medium">12pt</SelectItem>
                    <SelectItem value="large">14pt</SelectItem>
                    <SelectItem value="x-large">16pt</SelectItem>
                  </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-6" />

                {/* Text alignment */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedBlock.style.textAlign === 'left' ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, { textAlign: 'left' })}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBlock.style.textAlign === 'center' ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, { textAlign: 'center' })}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBlock.style.textAlign === 'right' ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, { textAlign: 'right' })}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedBlock.style.textAlign === 'justify' ? "default" : "outline"}
                    onClick={() => updateBlockStyle(selectedBlockId!, { textAlign: 'justify' })}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Color picker */}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="color"
                    value={selectedBlock.style.color}
                    onChange={(e) => updateBlockStyle(selectedBlockId!, { color: e.target.value })}
                    className="w-8 h-8 rounded border border-input cursor-pointer"
                    title="Barva textu"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="max-w-4xl mx-auto py-8">
          {/* Paper-like document */}
          <Card className="bg-background shadow-lg min-h-[800px]">
            <div className="p-12 space-y-6">
              {rules.map((block) => (
                <div key={block.id} className="group relative">
                  {isEditing ? (
                    <div
                      className={`relative border-2 border-transparent hover:border-primary/20 rounded-lg transition-colors ${selectedBlockId === block.id ? 'border-primary/40 bg-primary/5' : ''
                        }`}
                    >
                      {/* Block controls */}
                      <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteBlock(block.id)}
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            ×
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        onClick={() => setSelectedBlockId(block.id)}
                        className="min-h-[80px] border-none bg-transparent resize-none focus:ring-0 p-3"
                        placeholder="Začněte psát..."
                        style={{
                          color: block.style.color,
                          fontWeight: block.style.bold ? 'bold' : 'normal',
                          fontStyle: block.style.italic ? 'italic' : 'normal',
                          textDecoration: block.style.underline ? 'underline' : 'none',
                          textAlign: block.style.textAlign,
                          fontSize: {
                            'small': '14px',
                            'medium': '16px',
                            'large': '18px',
                            'x-large': '20px'
                          }[block.style.fontSize],
                          backgroundColor: block.style.backgroundColor || 'transparent'
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`${getHeadingStyles(block.type)} ${getBlockStyles(block)}`}
                      style={{
                        color: block.style.color,
                        backgroundColor: block.style.backgroundColor || 'transparent'
                      }}
                    >
                      {block.type === 'h1' && <h1>{block.content}</h1>}
                      {block.type === 'h2' && <h2>{block.content}</h2>}
                      {block.type === 'h3' && <h3>{block.content}</h3>}
                      {block.type === 'list' && <ul className="list-disc ml-6"><li>{block.content}</li></ul>}
                      {block.type === 'ordered-list' && <ol className="list-decimal ml-6"><li>{block.content}</li></ol>}
                      {block.type === 'paragraph' && <p>{block.content}</p>}
                    </div>
                  )}
                </div>
              ))}

              {rules.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-6 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">Prázdný dokument</h3>
                  <p className="mb-6">Začněte psát svůj článek</p>
                  {isEditing && (
                    <Button onClick={addNewBlock} className="bg-primary hover:bg-primary/90">
                      <Type className="w-4 h-4 mr-2" />
                      Vytvořit první odstavec
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}