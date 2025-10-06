import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Target, Trophy, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-learning.jpg';

export const LandingPage = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Mag-aral ng Bahagi ng Pananalita sa pamamagitan ng interactive activities',
    },
    {
      icon: Target,
      title: 'Four Activity Types',
      description: 'Multiple Choice, Drag & Drop, Matching Pairs, at Story Comprehension',
    },
    {
      icon: Trophy,
      title: 'Progress Tracking',
      description: 'Subaybayan ang inyong progress at makakuha ng mga rewards',
    },
    {
      icon: Users,
      title: 'Multi-Role System',
      description: 'Admin, Teacher, at Student roles na may kanya-kanyang features',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-hero/80" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            FiliUp
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Mag-aral ng Filipino nang masaya at interactive!
          </p>
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            Comprehensive platform para sa pag-aaral ng Bahagi ng Pananalita - 
            Pangngalan, Pandiwa, at Pang-uri gamit ang apat na uri ng activities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="btn-bounce">
              Simulan ang Pag-aaral
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Mag-login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Mga Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Komprehensibong platform na may lahat ng kailangan ninyo para sa effective na pag-aaral ng Filipino
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="learning-card text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-gradient-primary rounded-full w-fit">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Levels Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Mga Learning Levels</h2>
            <p className="text-xl text-muted-foreground">
              Structured curriculum na sunod-sunod ang pag-aaral
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                level: 'Level 1',
                title: 'Pangngalan (Nouns)',
                description: 'Mag-aral ng mga ngalan ng tao, bagay, hayop, lugar, at pangyayari',
                color: 'bg-gradient-primary',
              },
              {
                level: 'Level 2', 
                title: 'Pandiwa (Verbs)',
                description: 'Pag-aralan ang mga salitang nagsasaad ng kilos, galaw, o pangyayari',
                color: 'bg-gradient-warm',
              },
              {
                level: 'Level 3',
                title: 'Pang-uri (Adjectives)', 
                description: 'Mga salitang naglalarawan sa pangngalan o panghalip',
                color: 'bg-gradient-success',
              },
            ].map((level, index) => (
              <Card key={index} className="learning-card">
                <CardContent className="flex items-center p-6">
                  <div className={`${level.color} text-white p-4 rounded-lg mr-6`}>
                    <span className="font-bold text-lg">{level.level}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{level.title}</h3>
                    <p className="text-muted-foreground">{level.description}</p>
                  </div>
                  <Button variant="outline" className="btn-bounce">
                    Simulan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};