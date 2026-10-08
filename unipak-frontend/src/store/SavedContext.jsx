import React, { createContext, useState, useEffect } from 'react';

const SAVED_UNIVERSITIES_KEY = 'unipak-saved-universities';
const SAVED_RESULTS_KEY = 'unipak-saved-results';

function isSavedItem(item) {
  return item !== null && typeof item === 'object' && item.id !== undefined && item.id !== null;
}

function readSavedItems(key) {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return [];

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(isSavedItem) : [];
  } catch (error) {
    console.error(`Failed to read ${key}`, error);
    return [];
  }
}

function writeSavedItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Failed to save ${key}`, error);
  }
}

function hasMatchingId(item, id) {
  return String(item.id) === String(id);
}

export const SavedContext = createContext({
  savedUniversities: [],
  savedResults: [],
  toggleSaveUniversity: () => {},
  removeUniversity: () => {},
  saveResult: () => {},
  removeResult: () => {},
  clearAll: () => {},
  isUniversitySaved: () => false,
});

export function SavedProvider({ children }) {
  const [savedUniversities, setSavedUniversities] = useState(() => readSavedItems(SAVED_UNIVERSITIES_KEY));
  const [savedResults, setSavedResults] = useState(() => readSavedItems(SAVED_RESULTS_KEY));

  useEffect(() => {
    writeSavedItems(SAVED_UNIVERSITIES_KEY, savedUniversities);
  }, [savedUniversities]);

  useEffect(() => {
    writeSavedItems(SAVED_RESULTS_KEY, savedResults);
  }, [savedResults]);

  const toggleSaveUniversity = (uni) => {
    if (!isSavedItem(uni)) return;

    setSavedUniversities((prev) => {
      const exists = prev.some((item) => hasMatchingId(item, uni.id));
      if (exists) {
        return prev.filter((item) => !hasMatchingId(item, uni.id));
      }
      return [...prev, uni];
    });
  };

  const removeUniversity = (id) => {
    setSavedUniversities((prev) => prev.filter((item) => !hasMatchingId(item, id)));
  };

  const isUniversitySaved = (id) => {
    return savedUniversities.some((item) => hasMatchingId(item, id));
  };

  const saveResult = (result) => {
    if (!isSavedItem(result)) return;

    setSavedResults((prev) => {
      const exists = prev.findIndex((item) => hasMatchingId(item, result.id));
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = result;
        return updated;
      }
      return [...prev, result];
    });
  };

  const removeResult = (id) => {
    setSavedResults((prev) => prev.filter((item) => !hasMatchingId(item, id)));
  };

  const clearAll = () => {
    setSavedUniversities([]);
    setSavedResults([]);
  };

  return (
    <SavedContext.Provider
      value={{
        savedUniversities,
        savedResults,
        toggleSaveUniversity,
        removeUniversity,
        saveResult,
        removeResult,
        clearAll,
        isUniversitySaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}
