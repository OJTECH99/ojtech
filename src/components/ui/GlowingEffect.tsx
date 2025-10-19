import React, { Component } from 'react';
import { cn } from "../../lib/utils";
import { animate } from "motion";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

class GlowingEffect extends Component<GlowingEffectProps, any> {
  componentDidMount() {
    // TODO: Move useEffect with empty dependency array here
  }

  componentDidUpdate(prevProps: GlowingEffectProps, prevState: any) {
    // TODO: Move useEffect with dependencies here
  }

  componentWillUnmount() {
    // TODO: Move cleanup functions from useEffect here
  }

  // TODO: Replace useRef with React.createRef()

  render() {
    return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
  }
}

export default GlowingEffect;
