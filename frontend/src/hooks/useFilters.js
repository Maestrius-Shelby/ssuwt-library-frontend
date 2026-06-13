import { useState } from 'react';

const useFilters = (initialFilters) => {
    const [filters, setFilters] = useState(initialFilters);
    const [shouldResetFilters, setShouldResetFilters] = useState(false);

    const updateFilters = (newFilters) => {
        const shouldReset = Object.values(newFilters).every(value => 
            value === '' || (typeof value === 'object' && Object.values(value).every(v => v === ''))
        );

        if (shouldReset) {
            setFilters(initialFilters);
            setShouldResetFilters(true);
        } else {
            setFilters(newFilters);
            setShouldResetFilters(false);
        }
    };

    const resetFilterState = () => setShouldResetFilters(false);

    const resetFilters = () => {
        setFilters(initialFilters);
        setShouldResetFilters(true);
    };

    return {
        filters,
        setFilters,
        shouldResetFilters,
        updateFilters,
        resetFilterState,
        resetFilters,
    };
};

export default useFilters;