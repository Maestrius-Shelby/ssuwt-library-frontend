import React, { useCallback, useEffect, useRef, useState } from "react";
import AdvncFormSearch from "../components/UI/AdvncSearch/AdvncFormSearch";
import FilterPanel from "../components/UI/FilterPanel/FilterPanel";
import SearchResults from "../components/UI/SearchResults/SearchResults";
import useFilters from "../hooks/useFilters";
import ExportOptions from "../components/UI/ExportOptions/ExportOptions";
import { CSSTransition } from "react-transition-group";

const AdvancedSearch = () => {
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [isDepartmentOverlayActive, setIsDepartmentOverlayActive] =
    useState(false);
  const overlayRef = useRef(null);
  const [isAuthorAdded, setIsAuthorAdded] = useState(false);
  const [isInstituteSelected, setIsInstituteSelected] = useState(false);
  const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [isYearRangeApplied, setIsYearRangeApplied] = useState(false);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [author_fio, setAuthorFio] = useState("");

  const initialFilters = {
    participantCount: "",
    role: "",
    yearRange: { start: "", end: "" },
    alphabetSort: "",
    publicationYearSort: "",
  };

  const {
    filters,
    setFilters,
    shouldResetFilters,
    updateFilters,
    resetFilterState,
    resetFilters,
  } = useFilters(initialFilters);

  const [filteredResults, setFilteredResults] = useState([]);
  const [clearFormCallback, setClearFormCallback] = useState(() => {});
  const [isCriteriaMet, setIsCriteriaMet] = useState(false);
  const [isDepartmentCriteriaMet, setIsDepartmentCriteriaMet] = useState(false);

  useEffect(() => {
    setIsCriteriaMet(isAuthorAdded && isYearRangeApplied && isFiltersApplied);
  }, [isAuthorAdded, isYearRangeApplied, isFiltersApplied]);

  useEffect(() => {
    setIsDepartmentCriteriaMet(
      isInstituteSelected &&
        isDepartmentSelected &&
        isSearchClicked &&
        isYearRangeApplied &&
        isFiltersApplied
    );
  }, [
    isInstituteSelected,
    isDepartmentSelected,
    isSearchClicked,
    isYearRangeApplied,
    isFiltersApplied,
  ]);

  // Функция для получения отфильтрованных результатов
  const handleFilterResultsChange = useCallback((filtered) => {
    setFilteredResults(filtered);
  }, []);

  // Используем useCallback, чтобы onClear не изменялся при каждом рендере
  const handleClearSearch = useCallback((clearFormCallback) => {
    if (typeof clearFormCallback === "function") {
      setClearFormCallback(() => clearFormCallback);
    }
  }, []);

  return (
    <div
      className={`filterContainer ${
        isOverlayActive || isDepartmentOverlayActive ? "overlayActive" : ""
      }`}
    >
      <CSSTransition
        in={isOverlayActive || isDepartmentOverlayActive}
        timeout={500}
        classNames="overlay"
        unmountOnExit
        nodeRef={overlayRef}
      >
        <div ref={overlayRef} className="overlay"></div>
      </CSSTransition>

      <AdvncFormSearch
        onFindClick={updateFilters}
        filters={filters}
        setFilters={setFilters}
        isOverlayActive={isOverlayActive}
        isDepartmentOverlayActive={isDepartmentOverlayActive}
        onClear={handleClearSearch}
        setIsAuthorAdded={setIsAuthorAdded}
        setIsInstituteSelected={setIsInstituteSelected}
        setIsDepartmentSelected={setIsDepartmentSelected}
        isSearchClicked={isSearchClicked}
        setIsSearchClicked={setIsSearchClicked}
        setAuthorFio={setAuthorFio}
      />
      <div className="rightSidebar">
        <div className="filterSearchSection">
          <FilterPanel
            onFilterChange={setFilters}
            resetFilters={shouldResetFilters}
            onResetComplete={resetFilterState}
            filters={filters}
            setFilters={setFilters}
            isOverlayActive={isOverlayActive}
            isDepartmentOverlayActive={isDepartmentOverlayActive}
            setIsYearRangeApplied={setIsYearRangeApplied}
            setIsFiltersApplied={setIsFiltersApplied}
            isFiltersApplied={isFiltersApplied}
          />
        </div>

        <div className="exportOptionsSection">
          <ExportOptions
            filteredResults={filteredResults}
            setIsOverlayActive={setIsOverlayActive}
            setIsDepartmentOverlayActive={setIsDepartmentOverlayActive}
            isOverlayActive={isOverlayActive}
            isDepartmentOverlayActive={isDepartmentOverlayActive}
            resetFilters={resetFilters}
            handleClear={clearFormCallback}
            isCriteriaMet={isCriteriaMet}
            isDepartmentCriteriaMet={isDepartmentCriteriaMet}
            author_fio={author_fio}
          />
        </div>
      </div>

      <SearchResults
        filters={filters}
        onFilterResultsChange={handleFilterResultsChange}
        isOverlayActive={isOverlayActive}
        isDepartmentOverlayActive={isDepartmentOverlayActive}
      />
    </div>
  );
};

export default AdvancedSearch;
