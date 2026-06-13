import { createSelector } from "reselect";

const selectPersonalDomain = (state) => state.personal;

export const selectScientificMaterialsStatistics = createSelector(
  [selectPersonalDomain],
  (personalState) => personalState.scientificMaterialsStatistics
);

export const selectScientificMaterials = createSelector(
  [selectPersonalDomain],
  (personalState) => personalState.scientificMaterials
);

export const selectPublishedMaterials = createSelector(
  [selectScientificMaterials],
  (materials) => materials.filter((material) => material.status === true)
);

export const selectPendingMaterials = createSelector(
  [selectScientificMaterials],
  (materials) => materials.filter((material) => material.status === false)
);

export const selectPersonalLoading = createSelector(
  [selectPersonalDomain],
  (personalState) => personalState.isLoading
);