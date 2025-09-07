import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInLeft: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInRight: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.4, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverScale: React.FC<{
  children: React.ReactNode;
  scale?: number;
  className?: string;
}> = ({ children, scale = 1.05, className = '' }) => (
  <motion.div
    whileHover={{ scale }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ModalAnimation: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ children, isOpen, onClose, className = '' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const LoadingSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={`inline-block ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="w-full h-full border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
  </motion.div>
);

export const Bounce: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Pulse: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={className}
  >
    {children}
  </motion.div>
);

export const CardHover: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
    }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const RevealOnScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const TypeWriter: React.FC<{
  text: string;
  delay?: number;
  className?: string;
}> = ({ text, delay = 0.05, className = '' }) => {
  const letters = Array.from(text);
  
  return (
    <motion.span className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * delay }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

export const Float: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    animate={{ 
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);
