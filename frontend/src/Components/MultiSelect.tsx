import React from 'react';

interface Option {
    value: number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    value: number[];
    onChange: (selected: number[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange}) => {
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => Number(option.value));
        onChange(selectedOptions);
    };

    return (
        <select
            multiple
            value={value.map(String)}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 bg-white"
            style={{ height: '100px' }}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default MultiSelect; 