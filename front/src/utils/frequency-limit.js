// Launch a callback after a given delay if no exec or exec attemp occured since
const execAfterPause_list = {};
export const execAfterPause = (id, delay, cb) => {
    execAfterPause_list[id] = Date.now();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const now = Date.now();
            if (
                now - (execAfterPause_list[id] || 0) >= delay &&
                now - (hasBeenRecentlyExecuted_list[id] || 0) >= delay
            ) {
                hasBeenRecentlyExecuted_list[id] = now;
                resolve(cb());
            } else {
                reject(`execAfterPause is rejected`);
            }
        }, delay);
    });
};

// Allows an external code to limit the exec frequency of a function
// This util isnt responsible of the execution
const hasBeenRecentlyExecuted_list = {};
export const hasBeenRecentlyExecuted = (id, delay) => {
    const now = Date.now();
    const out = now - (hasBeenRecentlyExecuted_list[id] || 0) < delay;
    if (!out) {
        hasBeenRecentlyExecuted_list[id] = now;
    }
    return out;
};

export default {
    execAfterPause,
    hasBeenRecentlyExecuted,
};
