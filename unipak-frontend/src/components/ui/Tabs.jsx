import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "no-scrollbar inline-flex min-h-12 w-full items-center justify-start overflow-x-auto gap-1 rounded-full p-1 bg-slate-100 dark:border-slate-800 dark:bg-slate-950",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "group relative inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold outline-none transition-colors duration-200 last:border-r-0 dark:border-slate-800",
        "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
        "data-[state=active]:bg-white data-[state=active]:text-slate-950 dark:data-[state=active]:bg-indigo-950/45 dark:data-[state=active]:text-indigo-300",
        "focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
