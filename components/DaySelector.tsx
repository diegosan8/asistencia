
import React from 'react';
import { DAYS_OF_WEEK_CONFIG } from '../constants';
import type { DayOfWeekIndex } from '../types';

interface DaySelectorProps {
    selectedDays: Set<DayOfWeekIndex>;
    onToggleDay: (dayIndex: DayOfWeekIndex) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onToggleDay }) => {
    return (
        <div className="flex items-center justify-center space-x-1 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg border border-gray-300 dark:border-gray-600">
            {DAYS_OF_WEEK_CONFIG.map(({ index, short, name }) => {
                const isSelected = selectedDays.has(index);
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onToggleDay(index)}
                        title={name}
                        className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                            isSelected
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {short}
                    </button>
                );
            })}
        </div>
    );
};
