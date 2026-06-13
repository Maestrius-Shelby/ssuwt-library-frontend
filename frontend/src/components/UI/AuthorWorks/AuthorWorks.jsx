import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './AuthorWorks.module.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchResults } from '../../../ReduxStore/reducers/dataSlice';

const AuthorWorks = () => {
    const dispatch = useDispatch();
    const searchResults = useSelector((state) => state.data.searchResults);

    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;
    const resultsHeadingRef = useRef(null);
    const location = useLocation();

    console.log('searchResults', searchResults);

    useEffect(() => {
        const storedResults = localStorage.getItem('searchResults');
        if (storedResults) {
            dispatch(setSearchResults(JSON.parse(storedResults)));
        }

        if (location.state?.scrollToResults && resultsHeadingRef.current) {
            resultsHeadingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [dispatch, location.state]);

    useEffect(() => {
        if (location.state?.scrollToResults && resultsHeadingRef.current) {
            resultsHeadingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location, resultsHeadingRef]);

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

    const totalPages = Math.ceil(searchResults.length / resultsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className={styles.container}>
            <div className={styles.titleresult}>
                <h1 ref={resultsHeadingRef}>Опубликованные работы автора</h1>
            </div>
            {searchResults && searchResults.length > 0 ? (
                <>
                    <div className={styles.results}>
                        {currentResults.map((material, index) => (
                            <div key={index} className={styles.resultItem}>
                                <span className={styles.title}>
                                    {material.title}
                                    <span className={styles.year}> / {material.publication_year} г.</span>
                                </span>

                                {console.log('authors', material.authors)}
                                {material.authors && material.authors.length > 0 && (
                                    <span className={styles.author}>
                                        {material.authors.map((author, idx) => (
                                            <span key={idx}>
                                                {author.human.fio} ({author.relationship_type})
                                                {idx < material.authors.length - 1 ? ' , ' : ''}
                                            </span>
                                        ))}
                                    </span>
                                )}

                                <span className={styles.details}>
                                    {material.publication_type} / {material.rating} / {material.theme} /
                                    Издатель: {material.journal_publisher} / {material.count_of_pages} стр. / {material.department.institute} / {material.department.name}
                                </span>

                                {material.attached_file && (
                                    <div className={styles.buttomContainer}>
                                        <Link
                                            to={`/download/${material.attached_file}`}
                                            className={styles.downloadLink}
                                        >
                                            Скачать
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.pagination}>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <p className={styles.noResults}>Нет результатов поиска</p>
            )}
        </div>
    );
};

export default AuthorWorks;
