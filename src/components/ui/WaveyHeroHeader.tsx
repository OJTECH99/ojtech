import React, { Component, createRef, RefObject } from 'react';
import { Button } from "./Button";
import { Link } from "react-router-dom";

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageSrc?: string;
  waveColor1?: string;
  waveColor2?: string;
  waveColor3?: string;
  waveColor4?: string;
  waveColor5?: string;
  waveColor6?: string;
  waveColor7?: string;
  waveColor8?: string;
  waveOpacityBase?: number;
  waveOpacityIncrement?: number;
  waveAmplitude?: number;
  waveSpeedMultiplier?: number;
}

const defaultProps: HeroHeaderProps = {
  title: 'Find Your Perfect <br /> Internship Match',
  subtitle: 'Our AI-powered matching connects you with relevant job opportunities that align with your skills and aspirations.',
  primaryButtonText: 'Explore Opportunities',
  primaryButtonUrl: '/opportunities',
  secondaryButtonText: 'Upload Resume',
  secondaryButtonUrl: '/profile',
  imageSrc: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
  // Pure black and gray theme colors with increasing opacity
  waveColor1: 'rgba(30, 30, 30, 0.2)',
  waveColor2: 'rgba(35, 35, 35, 0.25)',
  waveColor3: 'rgba(40, 40, 40, 0.3)',
  waveColor4: 'rgba(45, 45, 45, 0.35)',
  waveColor5: 'rgba(50, 50, 50, 0.4)',
  waveColor6: 'rgba(55, 55, 55, 0.45)',
  waveColor7: 'rgba(60, 60, 60, 0.5)',
  waveColor8: 'rgba(65, 65, 65, 0.55)',
  waveOpacityBase: 0.2,
  waveOpacityIncrement: 0.05,
  waveAmplitude: 40,
  waveSpeedMultiplier: 0.005,
};

export class WaveyHeroHeader extends Component<HeroHeaderProps> {
  static defaultProps = defaultProps;
  
  private canvasRef: RefObject<HTMLCanvasElement>;
  private animationFrameId: number | null = null;
  private time: number = 0;

  constructor(props: HeroHeaderProps) {
    super(props);
    this.canvasRef = createRef<HTMLCanvasElement>();
  }

  componentDidMount() {
    this.initCanvas();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  handleResize = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }

  initCanvas = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    this.drawBackground(ctx, canvas.width, canvas.height);
  }
  
  drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const {
      waveColor1,
      waveColor2,
      waveColor3,
      waveColor4,
      waveColor5,
      waveColor6,
      waveColor7,
      waveColor8,
      waveOpacityBase,
      waveOpacityIncrement,
      waveAmplitude,
      waveSpeedMultiplier,
    } = this.props;
    
    ctx.clearRect(0, 0, width, height);

    // dark base - pure black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // flowing waves
    const waveColors = [
      waveColor1,
      waveColor2,
      waveColor3,
      waveColor4,
      waveColor5,
      waveColor6,
      waveColor7,
      waveColor8,
    ];
    
    for (let i = 0; i < 8; i++) {
      const opacity = (waveOpacityBase || 0.2) + i * (waveOpacityIncrement || 0.05);
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin((x + this.time + i * 100) * (waveSpeedMultiplier || 0.005)) * (waveAmplitude || 40) + i * 20;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColors[i] || `rgba(40, 40, 40, ${opacity})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    this.time += 1.5;
    this.animationFrameId = requestAnimationFrame(() => this.drawBackground(ctx, width, height));
  }

  render() {
    const {
      title,
      subtitle,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      imageSrc,
    } = this.props;

    return (
      <div className="relative w-full h-screen overflow-hidden bg-black text-white">
        {/* Full-width canvas background */}
        <canvas
          ref={this.canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0"
        />

        {/* Containerized content */}
        <div className="relative z-10 h-full">
          <div className="container mx-auto px-4 h-full">
            <div className="flex items-center justify-between h-full">
          <div className="max-w-xl">
            <h1
              className="text-5xl font-bold leading-tight bg-gradient-to-r from-gray-500 via-gray-300 to-gray-400 text-transparent bg-clip-text animate-fade-in-up"
              dangerouslySetInnerHTML={{ __html: title! }}
            />
            <p className="mt-6 text-lg text-gray-300 animate-fade-in-up delay-200">
              {subtitle}
            </p>
            <div className="mt-8 flex gap-4 animate-fade-in-up delay-300">
              {primaryButtonText && primaryButtonUrl && (
                <Link to={primaryButtonUrl}>
                  <Button 
                    variant="default" 
                    className="bg-gray-200 text-black hover:bg-gray-300"
                  >
                    {primaryButtonText}
                  </Button>
                </Link>
              )}
              {secondaryButtonText && secondaryButtonUrl && (
                <Link to={secondaryButtonUrl}>
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-900"
                  >
                    {secondaryButtonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block max-w-sm">
            <div
              className="backdrop-blur-sm bg-black/30 border border-gray-800 rounded-3xl p-4 transform-gpu transition-transform duration-500 -rotate-6 shadow-lg"
            >
              <img
                src={imageSrc}
                alt="Hero Visual"
                className="w-full h-auto object-contain rounded-2xl"
              />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
