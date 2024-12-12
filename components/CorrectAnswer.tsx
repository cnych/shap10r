import { FC } from 'react';
import type { Solution } from '@/lib/types';

interface CorrectAnswerProps {
  solution: Solution[] | null;
}

export const CorrectAnswer: FC<CorrectAnswerProps> = ({ solution }) => {
  if (!solution) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg">Correct Answer:</div>
      <div className="flex items-center justify-center gap-2">
        {solution.map((shape, index) => (
          <span
            key={index}
            style={{ color: shape.color }}
            className="text-4xl"
          >
            {shape.type}
          </span>
        ))}
      </div>
    </div>
  );
}; 