"use client"

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function renderTextWithLinks(text: string): React.ReactNode {
  console.log('renderTextWithLinks - Text received:', text);
  console.log('renderTextWithLinks - Text type:', typeof text);
  
  if (!text) return text;
  
  // Regex para detectar links markdown: [texto](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  // Reset regex lastIndex
  linkRegex.lastIndex = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    console.log('renderTextWithLinks - Match found:', match);
    console.log('renderTextWithLinks - Match index:', match.index);
    console.log('renderTextWithLinks - Match text:', match[1]);
    console.log('renderTextWithLinks - Match URL:', match[2]);
    
    // Agregar texto antes del link
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      console.log('renderTextWithLinks - Text before link:', textBefore);
      if (textBefore) {
        parts.push(textBefore);
      }
    }

    // Agregar el link como elemento <a>
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
      >
        {match[1]}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Agregar el texto restante
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    console.log('renderTextWithLinks - Remaining text:', remainingText);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  console.log('renderTextWithLinks - Parts array:', parts);
  console.log('renderTextWithLinks - Parts length:', parts.length);

  // Si no hay links, devolver el texto original como string
  if (parts.length === 0) {
    console.log('renderTextWithLinks - No parts, returning original text');
    return text;
  }

  // Si solo hay una parte y es string, devolverla directamente
  if (parts.length === 1 && typeof parts[0] === 'string') {
    console.log('renderTextWithLinks - Single string part, returning as string');
    return parts[0];
  }

  // Si hay múltiples partes, devolverlas como fragmento
  console.log('renderTextWithLinks - Returning fragment with', parts.length, 'parts');
  return <>{parts}</>;
}

