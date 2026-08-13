import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { createContext, useContext, useId, useRef, useState } from 'react';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export const Tabs = ({
  value,
  defaultValue = '',
  onValueChange,
  className = '',
  children,
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const baseId = useId();
  const isControlled = value !== undefined;

  const activeValue = isControlled ? (value ?? '') : internalValue;

  const setValue = (next: string) => {
    if (isControlled) {
      onValueChange?.(next);
    } else {
      setInternalValue(next);
    }
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onKeyDown'> {
  'aria-label': string;
  children: ReactNode;
}

export const TabList = ({
  'aria-label': ariaLabel,
  className = '',
  children,
  ...props
}: TabListProps) => {
  const context = useContext(TabsContext);
  const listRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('TabList must be used within a Tabs component');
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    if (tabs.length === 0) return;

    const currentIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
    );

    const keyHandler: Partial<Record<string, (index: number, length: number) => number>> = {
      ArrowRight: (index, length) => (index + 1) % length,
      ArrowLeft: (index, length) => (index - 1 + length) % length,
      Home: () => 0,
      End: (_index, length) => length - 1,
    };

    const handler = keyHandler[event.key];
    if (!handler) return;

    event.preventDefault();
    const nextTab = tabs[handler(currentIndex, tabs.length)];
    nextTab.focus();
    context.setValue(nextTab.dataset.value ?? '');
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`flex gap-1 border-b border-line ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export const Tab = ({ value, className = '', children, ...props }: TabProps) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tab must be used within a Tabs component');
  }

  const selected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${context.baseId}-tab-${value}`}
      aria-controls={`${context.baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      data-value={value}
      onClick={() => context.setValue(value)}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        selected
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-ink-subtle hover:border-line-strong hover:text-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export const TabPanel = ({ value, className = '', children }: TabPanelProps) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabPanel must be used within a Tabs component');
  }

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-panel-${value}`}
      aria-labelledby={`${context.baseId}-tab-${value}`}
      tabIndex={0}
      className={`pt-4 ${className}`}
    >
      {children}
    </div>
  );
};