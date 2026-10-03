/** Run the caller's poll observer inside the deadline. An observer failure
 * does not stop polling (the legacy callback contract); a stop does. */
export async function notifyPoll(deadline, callback, job, attempt, elapsed, nextDelay) {
    if (callback === undefined)
        return undefined;
    try {
        return await deadline.wait(() => Promise.resolve(callback(job, attempt, elapsed, nextDelay)));
    }
    catch (error) {
        if (deadline.reason() !== undefined)
            throw error;
        return undefined;
    }
}
