import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingPairsActivityProps {
  pairs: MatchingPair[];
  title: string;
  instructions: string;
  onComplete: (score: number, percentage: number) => void;
}

export const MatchingPairsActivity: React.FC<MatchingPairsActivityProps> = ({
  pairs,
  title,
  instructions,
  onComplete
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const leftItems = pairs.map(pair => ({ id: pair.id, text: pair.left }));
  const rightItems = pairs.map(pair => ({ id: pair.id, text: pair.right })).sort(() => Math.random() - 0.5);

  const handleLeftClick = (id: string) => {
    if (showResults || matches[id]) return;
    setSelectedLeft(selectedLeft === id ? null : id);
    setSelectedRight(null);
  };

  const handleRightClick = (id: string) => {
    if (showResults) return;
    
    // Check if this right item is already matched
    const isAlreadyMatched = Object.values(matches).includes(id);
    if (isAlreadyMatched) return;

    if (selectedLeft) {
      // Create a match
      setMatches(prev => ({ ...prev, [selectedLeft]: id }));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(selectedRight === id ? null : id);
    }
  };

  const handleRemoveMatch = (leftId: string) => {
    if (showResults) return;
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[leftId];
      return newMatches;
    });
  };

  const checkAnswers = () => {
    setShowResults(true);
    
    let correctCount = 0;
    Object.entries(matches).forEach(([leftId, rightId]) => {
      const pair = pairs.find(p => p.id === leftId);
      if (pair && pair.id === rightId) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / pairs.length) * 100);
    setTimeout(() => {
      onComplete(correctCount, percentage);
    }, 3000);
  };

  const resetActivity = () => {
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowResults(false);
  };

  const isMatchCorrect = (leftId: string) => {
    if (!showResults) return false;
    const rightId = matches[leftId];
    return rightId === leftId; // Since pair.id is the same for both left and right
  };

  const getMatchedRightId = (leftId: string) => {
    return matches[leftId];
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="learning-card">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-muted-foreground">{instructions}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-3">
              <h3 className="font-medium text-center">Salita</h3>
              {leftItems.map((item) => {
                const isMatched = !!matches[item.id];
                const isSelected = selectedLeft === item.id;
                const isCorrect = showResults && isMatchCorrect(item.id);
                const isIncorrect = showResults && isMatched && !isCorrect;
                const matchedRightId = matches[item.id];
                const matchedRightText = matchedRightId ? rightItems.find(r => r.id === matchedRightId)?.text : null;

                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className={`
                      w-full justify-between h-auto min-h-12 py-2 transition-all duration-200
                      ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                      ${isMatched && !showResults ? 'bg-muted border-muted-foreground' : ''}
                      ${isCorrect ? 'bg-success-light border-success' : ''}
                      ${isIncorrect ? 'bg-destructive/10 border-destructive' : ''}
                    `}
                    onClick={() => isMatched ? handleRemoveMatch(item.id) : handleLeftClick(item.id)}
                    disabled={showResults}
                  >
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-medium">{item.text}</span>
                      {isMatched && matchedRightText && (
                        <span className="text-xs text-muted-foreground">
                          paired with: <span className="font-semibold text-foreground">{matchedRightText}</span>
                        </span>
                      )}
                    </div>
                    {isMatched && (
                      <div className="flex items-center space-x-2">
                        {showResults && isCorrect && <CheckCircle className="h-4 w-4 text-success" />}
                        {!showResults && (
                          <span className="text-xs text-muted-foreground">
                            Tanggalin
                          </span>
                        )}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <h3 className="font-medium text-center">Uri / Katangian</h3>
              {rightItems.map((item) => {
                const isMatched = Object.values(matches).includes(item.id);
                const isSelected = selectedRight === item.id;
                const leftMatch = Object.keys(matches).find(key => matches[key] === item.id);
                const isCorrect = showResults && leftMatch === item.id;
                const isIncorrect = showResults && isMatched && !isCorrect;

                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className={`
                      w-full justify-start h-12 transition-all duration-200
                      ${isSelected ? 'ring-2 ring-accent bg-accent/10' : ''}
                      ${isMatched && !showResults ? 'bg-muted border-muted-foreground' : ''}
                      ${isCorrect ? 'bg-success-light border-success' : ''}
                      ${isIncorrect ? 'bg-destructive/10 border-destructive' : ''}
                    `}
                    onClick={() => handleRightClick(item.id)}
                    disabled={showResults || isMatched}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{item.text}</span>
                      {showResults && isCorrect && <CheckCircle className="h-4 w-4 text-success" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {Object.keys(matches).length} of {pairs.length} pairs na-match
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={resetActivity}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulit-ulitin
            </Button>
            
            <Button 
              variant="activity" 
              onClick={checkAnswers}
              disabled={Object.keys(matches).length !== pairs.length || showResults}
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