import { cn } from "../../lib/utils";

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
  children?: React.ReactNode;
}

const GlowingEffect: React.FC<GlowingEffectProps> = ({ 
  className, 
  children,
  disabled = false 
}) => {
  // TODO: Implement glowing effect with motion animation
  return (
    <div className={cn("relative", className, disabled && "pointer-events-none")}>
      {children}
    </div>
  );
};

export default GlowingEffect;
