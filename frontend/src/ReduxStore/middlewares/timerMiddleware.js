// const timerMiddleware = store => next => action => {
//     if (action.type === 'parsing/startParsingProcess/fulfilled') {
//         const { timeLeft, isProcessBlocked } = store.getState().parsing;
//         localStorage.setItem('timeLeft', timeLeft);
//         localStorage.setItem('isProcessBlocked', isProcessBlocked.toString());
//     }
//     return next(action);
// };

// export default timerMiddleware;
