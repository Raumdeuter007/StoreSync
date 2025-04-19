import React from 'react';

interface FilterOption {
    id: number;
    name: string;
    color?: string;
}

interface FilterCategoryProps {
    title: string;
    icon: React.ReactNode;
    options: FilterOption[];
    selectedValues: number[];
    onChange: (id: number) => void;
    maxHeight?: string;
    showColors?: boolean;
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
    title,
    icon,
    options,
    selectedValues,
    onChange,
    maxHeight = "max-h-32",
    showColors = false
}) => {
    return (
        <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                {icon}
                {title}
            </h3>
            <div className={`space-y-1 ${maxHeight} overflow-y-auto pr-2 custom-scrollbar`}>
                {options.map(option => (
                    <label key={option.id} 
                        className="flex items-center p-1.5 rounded-lg hover:bg-white transition-colors duration-150 cursor-pointer group text-sm">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.id)}
                                onChange={() => onChange(option.id)}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center
                                ${selectedValues.includes(option.id) 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300 group-hover:border-blue-400'}`}>
                                {selectedValues.includes(option.id) && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className={`ml-3 text-sm ${selectedValues.includes(option.id) 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {showColors ? (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${option.color}`}>
                                    {option.name}
                                </span>
                            ) : (
                                option.name
                            )}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}; 