import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './MainSearch.module.css';
import MyModalAdvncSearch from '../MyModalAdvncSearch/MyModalAdvncSearch';
import AdvncFormSearch from '../AdvncSearch/AdvncFormSearch';
import { mainSearchScientificMaterials, setSearchPerformed, setSearchResults } from '../../../ReduxStore/reducers/dataSlice';
import useFilters from '../../../hooks/useFilters';

const MainSearch = () => {
    const [modal, setModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { filters, setFilters, updateFilters } = useFilters({
        participantCount: '',
        role: '',
        yearRange: { start: '', end: '' },
        alphabetSort: '',
        publicationYearSort: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (searchQuery.trim() === '') return;

        try {
            const results = await dispatch(mainSearchScientificMaterials({ query: searchQuery })).unwrap();
            dispatch(setSearchResults(results));
            dispatch(setSearchPerformed(true));
            localStorage.setItem('searchResults', JSON.stringify(results));
            localStorage.setItem('searchPerformed', 'true');
            navigate('/AdvancedSearch', { state: { scrollToResults: true } });
        } catch (error) {
            console.error('Error performing search:', error);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={styles.centerwrapper}>
            <div className={styles.searchcontainer}>
                <button className={styles.searchleftbutton} onClick={() => setModal(true)}>Расш.Поиск</button>
                <input
                    type="text"
                    className={styles.searchinput}
                    placeholder="Найдите в библиотеке..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={styles.searchrightbutton}
                    onClick={handleSearch}
                    disabled={searchQuery.trim() === ''}
                >
                    Найти
                </button>
            </div>
            <MyModalAdvncSearch visible={modal} setVisible={setModal}>
                <AdvncFormSearch
                    onFindClick={updateFilters}
                    filters={filters}
                    setFilters={setFilters}
                />
            </MyModalAdvncSearch>
        </div>
    );
};

export default MainSearch;