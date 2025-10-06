import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface DragDropItem {
  id: string;
  text: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface DragDropActivityProps {
  items: DragDropItem[];
  categories: Category[];
  title: string;
  instructions: string;
  onComplete: (score: number, percentage: number) => void;
}

export const DragDropActivity: React.FC<DragDropActivityProps> = ({
  items,
  categories,
  title,
  instructions,
  onComplete
}) => {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<string, DragDropItem[]>>({});
  const [availableItems, setAvailableItems] = useState<DragDropItem[]>(items);
  const [showResults, setShowResults] = useState(false);

  const handleDragStart = (item: DragDropItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return;

    setDroppedItems(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), draggedItem]
    }));
    
    setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
    setDraggedItem(null);
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    const item = droppedItems[categoryId]?.find(i => i.id === itemId);
    if (!item) return;

    setDroppedItems(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(i => i.id !== itemId)
    }));
    
    setAvailableItems(prev => [...prev, item]);
  };

  const checkAnswers = () => {
    setShowResults(true);
    
    let correctCount = 0;
    let totalItems = 0;

    Object.entries(droppedItems).forEach(([categoryId, categoryItems]) => {
      categoryItems.forEach(item => {
        totalItems++;
        if (item.category === categoryId) {
          correctCount++;
        }
      });
    });

    const percentage = Math.round((correctCount / items.length) * 100);
    setTimeout(() => {
      onComplete(correctCount, percentage);
    }, 3000);
  };

  const resetActivity = () => {
    setDroppedItems({});
    setAvailableItems(items);
    setShowResults(false);
    setDraggedItem(null);
  };

  const isItemCorrect = (item: DragDropItem, categoryId: string) => {
    return showResults && item.category === categoryId;
  };

  const isItemIncorrect = (item: DragDropItem, categoryId: string) => {
    return showResults && item.category !== categoryId;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="learning-card">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-muted-foreground">{instructions}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Items */}
          <div className="space-y-2">
            <h3 className="font-medium">Mga Salita:</h3>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="drag-item bg-card border border-border rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onClick={() => handleDragStart(item)}
                >
                  {item.text}
                </div>
              ))}
              {availableItems.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  Lahat ng salita ay nailagay na sa mga kahon
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <h3 className={`font-medium text-center p-2 rounded-lg text-white ${category.color}`}>
                  {category.name}
                </h3>
                <div
                  className="drop-zone min-h-[120px] p-3 space-y-2"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(category.id);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => {
                    if (draggedItem) {
                      handleDrop(category.id);
                    }
                  }}
                >
                  {(droppedItems[category.id] || []).map((item) => (
                    <div
                      key={item.id}
                      className={`
                        p-2 rounded-lg border cursor-pointer transition-all duration-200
                        ${isItemCorrect(item, category.id) ? 'bg-success-light border-success' : ''}
                        ${isItemIncorrect(item, category.id) ? 'bg-destructive/10 border-destructive' : 'bg-muted border-border hover:bg-muted/80'}
                      `}
                      onClick={() => !showResults && handleRemoveItem(category.id, item.id)}
                      title={showResults ? undefined : "I-click para ibalik"}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.text}</span>
                        {showResults && isItemCorrect(item, category.id) && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                  {(droppedItems[category.id]?.length || 0) === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      I-drag ang mga salita dito
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={resetActivity}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulit-ulitin
            </Button>
            
            <Button 
              variant="activity" 
              onClick={checkAnswers}
              disabled={availableItems.length > 0 || showResults}
              className="btn-bounce"
            >
              Suriin ang Sagot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};