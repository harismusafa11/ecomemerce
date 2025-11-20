import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, memo } from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-brand-accent/60 block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = memo(({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-white group-hover:bg-transparent border border-transparent group-hover:border-brand-secondary/50 relative z-20 transition-colors duration-200 text-center",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
});
Card.displayName = 'Card';

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = memo(({
  className,
  children,
}) => {
  return (
    <h4 className={cn("text-brand-dark font-bold font-serif tracking-wide mt-4 text-xl", className)}>
      {children}
    </h4>
  );
});
CardTitle.displayName = 'CardTitle';

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = memo(({
  className,
  children,
}) => {
  return (
    <p
      className={cn(
        "mt-4 text-gray-600 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';