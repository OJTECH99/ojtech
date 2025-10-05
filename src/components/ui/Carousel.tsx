import { ReactNode } from 'react';

interface CarouselProps {
  children?: ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  // TODO: Implement carousel with embla-carousel
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
