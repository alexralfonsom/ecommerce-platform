// src/lib/utils/cn.ts - Versión actualizada
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🎯 ¿Por qué twMerge?
// Sin twMerge:
// cn("px-4 py-2", "px-6") // Result: "px-4 py-2 px-6" ❌ conflicto

// Con twMerge:
// cn("px-4 py-2", "px-6") // Result: "py-2 px-6" ✅ merged inteligentemente

// Ejemplo real en tu CustomButton:
// buttonVariants({ variant: "primary", size: "md" }) + className="px-8"
// Sin twMerge: "px-4 py-2 bg-indigo-600 px-8" ❌ duplicated px
// Con twMerge: "py-2 bg-indigo-600 px-8" ✅ merged correctly
