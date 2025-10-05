import { Component } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

// Root wrapper
export class ToggleGroup extends Component<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>> {
  render() {
    return <ToggleGroupPrimitive.Root {...this.props} />;
  }
}

// Item wrapper
export class ToggleGroupItem extends Component<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>> {
  render() {
    return <ToggleGroupPrimitive.Item {...this.props} />;
  }
}

export default ToggleGroup;
