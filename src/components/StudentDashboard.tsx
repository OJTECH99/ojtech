import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, Clock, Star, ArrowRight, CheckCircle, Lock, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MultipleChoiceActivity } from './activities/MultipleChoiceActivity';
import { DragDropActivity } from './activities/DragDropActivity';
import { MatchingPairsActivity } from './activities/MatchingPairsActivity';
import { StoryComprehensionActivity } from './activities/StoryComprehensionActivity';

type ActivityType = 'multiple-choice' | 'drag-drop' | 'matching-pairs' | 'story-comprehension' | null;
type ViewType = 'lesson' | 'activities';

interface ActivityScore {
  score: number;
  percentage: number;
  completed: boolean;
}

interface LessonProgress {
  [lessonId: string]: {
    lessonCompleted: boolean;
    activities: {
      'multiple-choice'?: ActivityScore;
      'drag-drop'?: ActivityScore;
      'matching-pairs'?: ActivityScore;
      'story-comprehension'?: ActivityScore;
    };
  };
}

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentActivity, setCurrentActivity] = useState<ActivityType>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('1');
  const [currentView, setCurrentView] = useState<ViewType>('activities');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});

  const phases = [
    {
      id: 'phase1',
      title: '📚 Phase 1: Bahagi ng Pananalita',
      description: 'Pangunahing bahagi ng pananalita sa Filipino',
      lessons: [
        {
          id: '1',
          title: 'Pangngalan (Nouns)',
          description: 'Pag-aralan ang mga ngalan ng tao, bagay, hayop, lugar, at pangyayari',
          totalActivities: 4,
          color: 'bg-gradient-primary',
        },
        {
          id: '2',
          title: 'Pandiwa (Verbs)',
          description: 'Mga salitang nagsasaad ng kilos, galaw, o pangyayari',
          totalActivities: 4,
          color: 'bg-gradient-success',
        },
        {
          id: '3',
          title: 'Pang-uri (Adjectives)',
          description: 'Mga salitang naglalarawan sa pangngalan o panghalip',
          totalActivities: 4,
          color: 'bg-gradient-accent',
        },
      ]
    },
    {
      id: 'phase2',
      title: '📘 Phase 2: Kasingkahulugan at Kasalungat',
      description: 'Pag-aralan ang mga salitang magkapareho at magkaiba ang kahulugan',
      lessons: [
        {
          id: '4',
          title: 'Kasingkahulugan at Kasalungat',
          description: 'Mga salitang magkapareho o magkaiba ang kahulugan',
          totalActivities: 8,
          color: 'bg-gradient-warm',
        },
      ]
    }
  ];

  // Helper function to get current lesson title
  const getCurrentLessonTitle = () => {
    for (const phase of phases) {
      const lesson = phase.lessons.find(l => l.id === selectedLevel);
      if (lesson) return lesson.title;
    }
    return 'Pangngalan';
  };

  const stats = [
    { label: 'Nakompletong Aralin', value: '3', icon: BookOpen, color: 'text-primary' },
    { label: 'Kabuuang Puntos', value: '240', icon: Trophy, color: 'text-warning' },
    { label: 'Kasalukuyang Level', value: 'Level 1', icon: Target, color: 'text-success' },
    { label: 'Araw na Nag-aral', value: '12', icon: Clock, color: 'text-accent' },
  ];

  // Sample data for activities - Level 1 (Pangngalan)
  const level1MultipleChoice = {
    questions: [
      {
        id: '1',
        question: 'Si _______ ay nagbabasa ng aklat.',
        options: ['Kumakain', 'Ana', 'Malaki'],
        correctAnswer: 1,
        explanation: 'Ang "Ana" ay pangngalan na tumutukoy sa tao.'
      },
      {
        id: '2', 
        question: 'Ang _______ ay tumatahol sa bakuran.',
        options: ['Aso', 'Tumakbo', 'Mabait'],
        correctAnswer: 0,
        explanation: 'Ang "Aso" ay pangngalan na tumutukoy sa hayop.'
      }
    ]
  };

  // Level 2 - Kasingkahulugan Activities
  const level2KasingkahuluganMC = {
    questions: [
      {
        id: '1',
        question: 'Ang guro ay _______ at matalino.',
        options: ['Marunong', 'Tamad', 'Maliit'],
        correctAnswer: 0,
        explanation: 'Ang "Marunong" ay kasingkahulugan ng "matalino".'
      },
      {
        id: '2',
        question: 'Si Liza ay _______ dahil nanalo siya.',
        options: ['Maligaya', 'Malungkot', 'Gutom'],
        correctAnswer: 0,
        explanation: 'Ang "Maligaya" ay kasingkahulugan ng "masaya".'
      }
    ]
  };

  // Level 2 - Kasalungat Activities  
  const level2KasalungatMC = {
    questions: [
      {
        id: '1',
        question: 'Si Ana ay malungkot, ngunit si Pedro ay _______.',
        options: ['Masaya', 'Pagod', 'Gutom'],
        correctAnswer: 0,
        explanation: 'Ang "Masaya" ay kasalungat ng "malungkot".'
      },
      {
        id: '2',
        question: 'Ang puno ay mataas, ngunit ang damo ay _______.',
        options: ['Mababa', 'Malakas', 'Maliit'],
        correctAnswer: 0,
        explanation: 'Ang "Mababa" ay kasalungat ng "mataas".'
      }
    ]
  };

  const level1DragDrop = {
    items: [
      { id: '1', text: 'pusa', category: 'hayop' },
      { id: '2', text: 'Juan', category: 'tao' },
      { id: '3', text: 'mesa', category: 'bagay' },
      { id: '4', text: 'simbahan', category: 'lugar' },
      { id: '5', text: 'guro', category: 'tao' },
      { id: '6', text: 'aklat', category: 'bagay' },
      { id: '7', text: 'parke', category: 'lugar' },
    ],
    categories: [
      { id: 'tao', name: 'Tao', color: 'bg-primary' },
      { id: 'bagay', name: 'Bagay', color: 'bg-secondary' },
      { id: 'hayop', name: 'Hayop', color: 'bg-accent' },
      { id: 'lugar', name: 'Lugar', color: 'bg-success' },
    ]
  };

  const level2KasingkahuluganDragDrop = {
    items: [
      { id: '1', text: 'masaya', category: 'synonyms' },
      { id: '2', text: 'maligaya', category: 'synonyms' },
      { id: '3', text: 'maganda', category: 'synonyms' },
      { id: '4', text: 'marikit', category: 'synonyms' },
      { id: '5', text: 'matalino', category: 'synonyms' },
      { id: '6', text: 'marunong', category: 'synonyms' },
    ],
    categories: [
      { id: 'synonyms', name: 'Mga Kasingkahulugan', color: 'bg-gradient-primary' },
    ]
  };

  const level2KasalungatDragDrop = {
    items: [
      { id: '1', text: 'malakas', category: 'antonym1' },
      { id: '2', text: 'mahina', category: 'antonym1' },
      { id: '3', text: 'mataas', category: 'antonym2' },
      { id: '4', text: 'mababa', category: 'antonym2' },
      { id: '5', text: 'mainit', category: 'antonym3' },
      { id: '6', text: 'malamig', category: 'antonym3' },
    ],
    categories: [
      { id: 'antonym1', name: 'Malakas ↔ Mahina', color: 'bg-gradient-warm' },
      { id: 'antonym2', name: 'Mataas ↔ Mababa', color: 'bg-gradient-success' },
      { id: 'antonym3', name: 'Mainit ↔ Malamig', color: 'bg-gradient-accent' },
    ]
  };

  const level1MatchingPairs = {
    pairs: [
      { id: '1', left: 'Lamesa', right: 'Bagay' },
      { id: '2', left: 'Aso', right: 'Hayop' },
      { id: '3', left: 'Ana', right: 'Tao' },
      { id: '4', left: 'Palengke', right: 'Lugar' },
    ]
  };

  const level2KasalungatMatching = {
    pairs: [
      { id: '1', left: 'Bata', right: 'Matanda' },
      { id: '2', left: 'Malinis', right: 'Marumi' },
      { id: '3', left: 'Maliit', right: 'Malaki' },
      { id: '4', left: 'Masaya', right: 'Malungkot' },
    ]
  };

  const level1StoryComprehension = {
    story: `Si Lito ay pumunta sa palengke kasama ang kanyang kapatid. Bumili siya ng mansanas at tinapay. Pagkatapos ay naglaro sila ng bola sa parke.`,
    questions: [
      {
        id: '1',
        question: 'Saan pumunta si Lito?',
        options: ['Simbahan', 'Palengke', 'Paaralan'],
        correctAnswer: 1,
        explanation: 'Sa kwento, nabanggit na pumunta si Lito sa palengke.'
      },
      {
        id: '2',
        question: 'Ano ang dala nila sa parke?',
        options: ['Aklat', 'Bola', 'Sapatos'],
        correctAnswer: 1,
        explanation: 'Sa kwento, naglaro sila ng bola sa parke.'
      }
    ]
  };

  const level2KasingkahuluganStory = {
    story: `Si Liza ay maligaya dahil bakasyon na. Siya ay marikit sa kanyang bagong damit. Siya at ang kanyang kapatid ay nagpunta sa malaking parke.`,
    questions: [
      {
        id: '1',
        question: 'Ano ang kasingkahulugan ng salitang maligaya sa kwento?',
        options: ['Masaya', 'Malungkot', 'Gutom'],
        correctAnswer: 0,
        explanation: 'Ang "masaya" ay kasingkahulugan ng "maligaya".'
      },
      {
        id: '2',
        question: 'Ano ang inilarawan bilang marikit?',
        options: ['Damit', 'Paraiso', 'Bahay'],
        correctAnswer: 0,
        explanation: 'Sa kwento, ang damit ni Liza ang inilarawan na marikit.'
      }
    ]
  };

  const level2KasalungatStory = {
    story: `Si Marco ay malungkot kahapon dahil umuulan. Ngunit ngayong araw, siya ay masaya dahil maaraw na. Pumunta siya sa mataas na bundok at nakakita ng maliit na kubo.`,
    questions: [
      {
        id: '1',
        question: 'Ano ang kasalungat ng malungkot sa kwento?',
        options: ['Masaya', 'Pagod', 'Matanda'],
        correctAnswer: 0,
        explanation: 'Ang "masaya" ay kasalungat ng "malungkot".'
      },
      {
        id: '2',
        question: 'Ano ang kasalungat ng mataas sa kwento?',
        options: ['Mababa', 'Maliit', 'Mabigat'],
        correctAnswer: 0,
        explanation: 'Ang "mababa" ay kasalungat ng "mataas".'
      }
    ]
  };

  // Get current activity data based on selected level
  const getCurrentActivityData = () => {
    if (selectedLevel === '1') {
      return {
        multipleChoice: level1MultipleChoice,
        dragDrop: level1DragDrop,
        matchingPairs: level1MatchingPairs,
        storyComprehension: level1StoryComprehension,
      };
    } else if (selectedLevel === '2') {
      return {
        multipleChoice: level2KasingkahuluganMC,
        dragDrop: level2KasingkahuluganDragDrop,
        matchingPairs: level2KasalungatMatching,
        storyComprehension: level2KasingkahuluganStory,
      };
    }
    return {
      multipleChoice: level1MultipleChoice,
      dragDrop: level1DragDrop,
      matchingPairs: level1MatchingPairs,
      storyComprehension: level1StoryComprehension,
    };
  };

  const handleActivityComplete = (score: number, percentage: number) => {
    console.log(`Activity completed with score: ${score}, percentage: ${percentage}%`);
    
    // Update lesson progress
    if (currentActivity) {
      setLessonProgress(prev => ({
        ...prev,
        [selectedLevel]: {
          ...prev[selectedLevel],
          lessonCompleted: prev[selectedLevel]?.lessonCompleted || false,
          activities: {
            ...prev[selectedLevel]?.activities,
            [currentActivity]: {
              score,
              percentage,
              completed: true,
            },
          },
        },
      }));
    }
    
    setCurrentActivity(null);
  };

  // ===== PROGRESSION SYSTEM =====
  // Students must complete each lesson sequentially with all activities at 75%+ to unlock the next.
  // To unlock a lesson (both reading and activities):
  // 1. Complete all 4 activities in the PREVIOUS lesson
  // 2. Each activity must have a score of 75% or above
  // Example: To unlock Pandiwa (lesson + activities), complete all Pangngalan activities with 75%+ each
  // Note: Pangngalan (first lesson) is always unlocked

  // Helper function to check if an activity is unlocked
  const isActivityUnlocked = (lessonId: string, activity: ActivityType): boolean => {
    const progress = lessonProgress[lessonId];
    
    // First check if the lesson's activities are unlocked based on previous lesson completion
    if (!areActivitiesUnlocked(lessonId)) {
      return false;
    }
    
    // Lesson must be completed first
    if (!progress?.lessonCompleted) {
      return false;
    }

    // Multiple Choice is always unlocked after lesson (if activities are unlocked)
    if (activity === 'multiple-choice') {
      return true;
    }

    // Drag-Drop unlocks if Multiple Choice >= 75%
    if (activity === 'drag-drop') {
      const mcScore = progress.activities['multiple-choice'];
      return mcScore ? mcScore.percentage >= 75 : false;
    }

    // Matching Pairs unlocks if Drag-Drop >= 75%
    if (activity === 'matching-pairs') {
      const ddScore = progress.activities['drag-drop'];
      return ddScore ? ddScore.percentage >= 75 : false;
    }

    // Story Comprehension unlocks if Matching Pairs >= 75%
    if (activity === 'story-comprehension') {
      const mpScore = progress.activities['matching-pairs'];
      return mpScore ? mpScore.percentage >= 75 : false;
    }

    return false;
  };

  // Helper function to get activity status
  const getActivityStatus = (lessonId: string, activity: ActivityType): 'locked' | 'unlocked' | 'completed' => {
    const progress = lessonProgress[lessonId];
    
    if (progress?.activities[activity!]?.completed) {
      return 'completed';
    }
    
    if (isActivityUnlocked(lessonId, activity)) {
      return 'unlocked';
    }
    
    return 'locked';
  };

  // Helper function to get activity percentage
  const getActivityPercentage = (lessonId: string, activity: ActivityType): number | undefined => {
    return lessonProgress[lessonId]?.activities[activity!]?.percentage;
  };

  // Helper function to check if all activities in a lesson are completed with 75%+
  const isLessonFullyCompleted = (lessonId: string): boolean => {
    const progress = lessonProgress[lessonId];
    if (!progress || !progress.lessonCompleted) return false;

    const activities: ActivityType[] = ['multiple-choice', 'drag-drop', 'matching-pairs', 'story-comprehension'];
    
    // Check if all activities are completed with 75% or above
    return activities.every(activity => {
      const activityProgress = progress.activities[activity];
      return activityProgress && activityProgress.completed && activityProgress.percentage >= 75;
    });
  };

  // Helper function to check if a lesson's activities should be unlocked
  const areActivitiesUnlocked = (lessonId: string): boolean => {
    // First lesson (Pangngalan) activities are unlocked once lesson is read
    if (lessonId === '1') return completedLessons.has('1');

    // For subsequent lessons, check if previous lesson is fully completed
    const lessonIdNum = parseInt(lessonId);
    const previousLessonId = (lessonIdNum - 1).toString();
    
    return isLessonFullyCompleted(previousLessonId);
  };

  // Helper function to calculate lesson progress percentage
  const getLessonProgress = (lessonId: string): number => {
    const progress = lessonProgress[lessonId];
    if (!progress) return 0;

    const activities: ActivityType[] = ['multiple-choice', 'drag-drop', 'matching-pairs', 'story-comprehension'];
    let completedCount = 0;

    activities.forEach(activity => {
      if (progress.activities[activity]?.completed) {
        completedCount++;
      }
    });

    return Math.round((completedCount / activities.length) * 100);
  };

  // Helper function to count completed activities
  const getCompletedActivitiesCount = (lessonId: string): number => {
    const progress = lessonProgress[lessonId];
    if (!progress) return 0;

    const activities: ActivityType[] = ['multiple-choice', 'drag-drop', 'matching-pairs', 'story-comprehension'];
    let count = 0;

    activities.forEach(activity => {
      if (progress.activities[activity]?.completed) {
        count++;
      }
    });

    return count;
  };

  const currentData = getCurrentActivityData();

  if (currentActivity === 'multiple-choice') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={() => setCurrentActivity(null)} className="mb-4">
            ← Bumalik sa Dashboard
          </Button>
        </div>
        <MultipleChoiceActivity
          questions={currentData.multipleChoice.questions}
          title={`Multiple Choice - ${getCurrentLessonTitle()}`}
          onComplete={handleActivityComplete}
        />
      </div>
    );
  }

  if (currentActivity === 'drag-drop') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={() => setCurrentActivity(null)} className="mb-4">
            ← Bumalik sa Dashboard
          </Button>
        </div>
        <DragDropActivity
          items={currentData.dragDrop.items}
          categories={currentData.dragDrop.categories}
          title={`Drag & Drop - ${getCurrentLessonTitle()}`}
          instructions={selectedLevel === '4' ? "Ipares ang mga salita sa kanilang kasingkahulugan o kasalungat" : "Ilagay ang mga salita sa tamang kahon: Tao, Bagay, Hayop, Lugar"}
          onComplete={handleActivityComplete}
        />
      </div>
    );
  }

  if (currentActivity === 'matching-pairs') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={() => setCurrentActivity(null)} className="mb-4">
            ← Bumalik sa Dashboard
          </Button>
        </div>
        <MatchingPairsActivity
          pairs={currentData.matchingPairs.pairs}
          title={`Matching Pairs - ${getCurrentLessonTitle()}`}
          instructions={selectedLevel === '4' ? "Ipares ang mga salita sa kanilang kasalungat" : "Ipares ang mga salita sa kanilang tamang uri ng pangngalan"}
          onComplete={handleActivityComplete}
        />
      </div>
    );
  }

  if (currentActivity === 'story-comprehension') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={() => setCurrentActivity(null)} className="mb-4">
            ← Bumalik sa Dashboard
          </Button>
        </div>
        <StoryComprehensionActivity
          title={`Story Comprehension - ${getCurrentLessonTitle()}`}
          story={currentData.storyComprehension.story}
          questions={currentData.storyComprehension.questions}
          onComplete={handleActivityComplete}
        />
      </div>
    );
  }

  const lessonContent = {
    '1': {
      title: 'Pangngalan (Nouns)',
      slides: [
        {
          title: 'Ano ang Pangngalan?',
          content: [
            'Ang pangngalan ay mga salitang nagtutukoy sa ngalan ng tao, bagay, hayop, lugar, at pangyayari.',
            '',
            '• 👤 Tao: Ana, Maria, guro, bata',
            '• 📦 Bagay: libro, mesa, sapatos, bola',
            '• 🐕 Hayop: aso, pusa, ibon, kabayo',
            '• 🏢 Lugar: bahay, paaralan, palengke, Maynila',
            '• 🎉 Pangyayari: kasal, party, graduation, contest'
          ]
        },
        {
          title: 'Mga Halimbawa',
          content: [
            'Tingnan natin ang mga pangngalan sa mga pangungusap:',
            '',
            '• Si Ana ay kumakain ng mansanas.',
            '  - Ana (tao), mansanas (bagay)',
            '',
            '• Ang aso ay tumatahol sa bakuran.',
            '  - aso (hayop), bakuran (lugar)',
            '',
            '• May graduation sa paaralan.',
            '  - graduation (pangyayari), paaralan (lugar)'
          ]
        }
      ]
    },
    '2': {
      title: 'Pandiwa (Verbs)',
      slides: [
        {
          title: 'Ano ang Pandiwa?',
          content: [
            'Ang pandiwa ay mga salitang nagsasaad ng kilos, galaw, o pangyayari.',
            '',
            '• Kilos: tumakbo, kumain, maglaro',
            '• Galaw: lumakad, tumalon, sumayaw',
            '• Pangyayari: nangyari, magaganap, naranasan'
          ]
        }
      ]
    },
    '3': {
      title: 'Pang-uri (Adjectives)', 
      slides: [
        {
          title: 'Ano ang Pang-uri?',
          content: [
            'Ang pang-uri ay mga salitang naglalarawan sa pangngalan o panghalip.',
            '',
            '• Kulay: pula, asul, dilaw',
            '• Laki: malaki, maliit, katamtaman',
            '• Ugali: mabait, masipag, matulungin'
          ]
        }
      ]
    },
    '4': {
      title: 'Kasingkahulugan at Kasalungat',
      slides: [
        {
          title: 'Kasingkahulugan',
          content: [
            'Kasingkahulugan – ito ay mga salitang magkapareho o magkahawig ang kahulugan.',
            '',
            '• Halimbawa:',
            '  ○ maganda ↔ marikit',
            '  ○ masaya ↔ maligaya',
            '  ○ matalino ↔ marunong',
            '  ○ malaki ↔ higante',
            '',
            '👉 Tandaan: Ang pag-alam ng kasingkahulugan ay nakatutulong upang mas mapalawak ang talasalitaan.'
          ]
        },
        {
          title: 'Kasalungat',
          content: [
            'Kasalungat – ito ay mga salitang magkaiba o magkabaligtad ang kahulugan.',
            '',
            '• Halimbawa:',
            '  ○ malaki ↔ maliit',
            '  ○ masaya ↔ malungkot',
            '  ○ mabilis ↔ mabagal',
            '  ○ mainit ↔ malamig',
            '',
            '👉 Tandaan: Ang kasalungat ay nakatutulong sa mas malalim na pag-unawa ng kahulugan ng salita.'
          ]
        }
      ]
    }
  };

  // Lesson View
  if (currentView === 'lesson') {
    const currentLesson = lessonContent[selectedLevel as keyof typeof lessonContent];

    const handleCompleteLesson = () => {
      setCompletedLessons(prev => new Set(prev).add(selectedLevel));
      
      // Mark lesson as completed in progress
      setLessonProgress(prev => ({
        ...prev,
        [selectedLevel]: {
          ...prev[selectedLevel],
          lessonCompleted: true,
          activities: prev[selectedLevel]?.activities || {},
        },
      }));
      
      setCurrentView('activities');
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button variant="ghost" onClick={() => setCurrentView('activities')} className="mb-4">
            ← Bumalik sa Dashboard
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto p-6">
          <Card className="learning-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                {currentLesson.title}
              </CardTitle>
              <div className="text-center text-muted-foreground">
                Slide {currentSlide + 1} of {currentLesson.slides.length}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center">
                  {currentLesson.slides[currentSlide].title}
                </h3>
                <div className="space-y-3 text-lg leading-relaxed">
                  {currentLesson.slides[currentSlide].content.map((line, index) => (
                    <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  ← Previous
                </Button>

                <Progress value={(currentSlide + 1) / currentLesson.slides.length * 100} className="w-48" />

                {currentSlide < currentLesson.slides.length - 1 ? (
                  <Button
                    variant="default"
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleCompleteLesson}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Lesson
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">FiliUp</h1>
            <p className="text-muted-foreground">Kumusta, {user?.name}! 👋</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/leaderboard')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={logout}>
              Mag-logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-4">
                  <div className={`p-2 rounded-lg bg-gradient-primary mr-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Levels */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Mga Aralin</h2>
          
          {phases.map((phase) => (
            <div key={phase.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-primary">{phase.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4">{phase.description}</p>
              
              <div className="grid gap-6">
                {phase.lessons.map((lesson) => {
                  const lessonProgress = getLessonProgress(lesson.id);
                  const completedActivitiesCount = getCompletedActivitiesCount(lesson.id);
                  const activitiesUnlocked = areActivitiesUnlocked(lesson.id);
                  const lessonFullyCompleted = isLessonFullyCompleted(lesson.id);
                  
                  return (
                  <Card key={lesson.id} className="learning-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`${lesson.color} p-3 rounded-lg text-white`}>
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold mb-2">{lesson.title}</h4>
                            <p className="text-muted-foreground mb-3">{lesson.description}</p>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Progress value={lessonProgress} className="w-32" />
                                <span className="text-sm font-medium">{lessonProgress}%</span>
                              </div>
                              <Badge variant="secondary">
                                {completedActivitiesCount}/{lesson.totalActivities} activities
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {lessonProgress > 0 && lessonProgress < 100 && <Star className="h-5 w-5 text-warning" />}
                          {lessonFullyCompleted && <CheckCircle className="h-5 w-5 text-success" />}
                        </div>
                      </div>

                      {/* Lesson and Activity Buttons */}
                      <div className="space-y-4">
                          {/* Read Lesson Button - Locked if previous lesson not completed */}
                          <div className="border-b pb-4">
                            <Button
                              variant={completedLessons.has(lesson.id) ? "success" : "hero"}
                              className="w-full h-16 text-lg"
                              disabled={!activitiesUnlocked && lesson.id !== '1'}
                              onClick={() => {
                                setSelectedLevel(lesson.id);
                                setCurrentView('lesson');
                                setCurrentSlide(0);
                              }}
                            >
                              {!activitiesUnlocked && lesson.id !== '1' ? (
                                <Lock className="h-5 w-5 mr-2" />
                              ) : completedLessons.has(lesson.id) ? (
                                <CheckCircle className="h-5 w-5 mr-2" />
                              ) : (
                                <BookOpen className="h-5 w-5 mr-2" />
                              )}
                              {!activitiesUnlocked && lesson.id !== '1' ? 'Lesson Locked' : completedLessons.has(lesson.id) ? 'Lesson Completed - Read Again' : 'Read Lesson First'}
                            </Button>
                          </div>

                          {/* Warning Message if Lesson is Locked */}
                          {!activitiesUnlocked && lesson.id !== '1' && (
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                              <div className="flex items-start space-x-3">
                                <Lock className="h-5 w-5 text-warning mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-warning">Lesson Locked</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Complete all activities in <strong>{phases.flatMap(p => p.lessons).find(l => l.id === (parseInt(lesson.id) - 1).toString())?.title}</strong> with 75% or above to unlock this lesson and its activities.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Activity Buttons */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Multiple Choice */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'multiple-choice');
                              const percentage = getActivityPercentage(lesson.id, 'multiple-choice');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              
                              return (
                                <div className="relative">
                                  <Button
                                    variant={isCompleted ? "success" : "outline"}
                                    className={`h-20 flex-col space-y-1 w-full ${isCompleted ? 'border-success' : ''}`}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (!isLocked) {
                                        setSelectedLevel(lesson.id);
                                        setCurrentActivity('multiple-choice');
                                        setCurrentView('activities');
                                      }
                                    }}
                                  >
                                    {isLocked && <Lock className="h-4 w-4 mb-1" />}
                                    {isCompleted && <CheckCircle className="h-4 w-4 mb-1 text-success" />}
                                    <Target className="h-5 w-5" />
                                    <span className="text-xs">Multiple Choice</span>
                                    {percentage !== undefined && (
                                      <span className="text-xs font-semibold">{percentage}%</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })()}

                            {/* Drag & Drop */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'drag-drop');
                              const percentage = getActivityPercentage(lesson.id, 'drag-drop');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              const prevPercentage = getActivityPercentage(lesson.id, 'multiple-choice');
                              
                              return (
                                <div className="relative">
                                  <Button
                                    variant={isCompleted ? "success" : "outline"}
                                    className={`h-20 flex-col space-y-1 w-full ${isCompleted ? 'border-success' : ''}`}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (!isLocked) {
                                        setSelectedLevel(lesson.id);
                                        setCurrentActivity('drag-drop');
                                        setCurrentView('activities');
                                      }
                                    }}
                                  >
                                    {isLocked && <Lock className="h-4 w-4 mb-1" />}
                                    {isCompleted && <CheckCircle className="h-4 w-4 mb-1 text-success" />}
                                    <ArrowRight className="h-5 w-5" />
                                    <span className="text-xs">Drag & Drop</span>
                                    {percentage !== undefined && (
                                      <span className="text-xs font-semibold">{percentage}%</span>
                                    )}
                                    {isLocked && prevPercentage !== undefined && prevPercentage < 75 && (
                                      <span className="text-xs text-muted-foreground">Need 75%</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })()}

                            {/* Matching Pairs */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'matching-pairs');
                              const percentage = getActivityPercentage(lesson.id, 'matching-pairs');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              const prevPercentage = getActivityPercentage(lesson.id, 'drag-drop');
                              
                              return (
                                <div className="relative">
                                  <Button
                                    variant={isCompleted ? "success" : "outline"}
                                    className={`h-20 flex-col space-y-1 w-full ${isCompleted ? 'border-success' : ''}`}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (!isLocked) {
                                        setSelectedLevel(lesson.id);
                                        setCurrentActivity('matching-pairs');
                                        setCurrentView('activities');
                                      }
                                    }}
                                  >
                                    {isLocked && <Lock className="h-4 w-4 mb-1" />}
                                    {isCompleted && <CheckCircle className="h-4 w-4 mb-1 text-success" />}
                                    <Star className="h-5 w-5" />
                                    <span className="text-xs">Matching Pairs</span>
                                    {percentage !== undefined && (
                                      <span className="text-xs font-semibold">{percentage}%</span>
                                    )}
                                    {isLocked && prevPercentage !== undefined && prevPercentage < 75 && (
                                      <span className="text-xs text-muted-foreground">Need 75%</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })()}

                            {/* Story Reading */}
                            {(() => {
                              const status = getActivityStatus(lesson.id, 'story-comprehension');
                              const percentage = getActivityPercentage(lesson.id, 'story-comprehension');
                              const isLocked = status === 'locked';
                              const isCompleted = status === 'completed';
                              const prevPercentage = getActivityPercentage(lesson.id, 'matching-pairs');
                              
                              return (
                                <div className="relative">
                                  <Button
                                    variant={isCompleted ? "success" : "outline"}
                                    className={`h-20 flex-col space-y-1 w-full ${isCompleted ? 'border-success' : ''}`}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (!isLocked) {
                                        setSelectedLevel(lesson.id);
                                        setCurrentActivity('story-comprehension');
                                        setCurrentView('activities');
                                      }
                                    }}
                                  >
                                    {isLocked && <Lock className="h-4 w-4 mb-1" />}
                                    {isCompleted && <CheckCircle className="h-4 w-4 mb-1 text-success" />}
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-xs">Story Reading</span>
                                    {percentage !== undefined && (
                                      <span className="text-xs font-semibold">{percentage}%</span>
                                    )}
                                    {isLocked && prevPercentage !== undefined && prevPercentage < 75 && (
                                      <span className="text-xs text-muted-foreground">Need 75%</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};