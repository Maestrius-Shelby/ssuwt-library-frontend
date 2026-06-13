import { createSelector } from "reselect";

const selectVerifyDomain = (state) => state.verify;

export const makeSelectVerifiedWorks = createSelector(
    [selectVerifyDomain],
    (verifyState) => verifyState.verifiedWorks.filter((work) => !work.is_verified)
  );

export const makeSelectVerifyLoading = createSelector(
  [selectVerifyDomain],
  (verifyState) => verifyState.isLoading
);