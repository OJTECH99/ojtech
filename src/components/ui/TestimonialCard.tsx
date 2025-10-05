import { Component } from 'react';
import { cn } from "../../lib/utils"

interface TestimonialAuthor {
  name: string;
  role?: string;
  imageUrl?: string;
}

interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

class TestimonialCard extends Component<TestimonialCardProps, any> {
  render() {
    const { author, text, href, className } = this.props;
    const Content = (
      <div className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        "hover:shadow-md transition-shadow",
        className
      )}>
        <div className="flex items-center gap-3">
          {/* Minimal Avatar placeholder since Avatar component is a stub */}
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
            {author.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.imageUrl} alt={author.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-medium">
                {author.name?.charAt(0) ?? "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none truncate">{author.name}</p>
            {author.role && (
              <p className="text-xs text-muted-foreground truncate">{author.role}</p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      </div>
    );

    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {Content}
        </a>
      );
    }

    return Content;
  }
}

export default TestimonialCard;
