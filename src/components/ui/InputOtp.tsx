import { Component } from 'react';
import { cn } from '../../lib/utils';

interface InputOtpProps {
  value?: string;
  length?: number;
  className?: string;
}

class InputOtp extends Component<InputOtpProps> {
  render() {
    const { value = '', length = 6, className } = this.props;
    const chars = Array.from({ length }, (_, i) => value[i] ?? '');

    return (
      <div className={cn('flex gap-1', className)}>
        {chars.map((ch, idx) => (
          <div
            key={idx}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md'
            )}
          >
            {ch}
          </div>
        ))}
      </div>
    );
  }
}

export default InputOtp;
