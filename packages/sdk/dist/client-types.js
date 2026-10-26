/**
 * Thrown by `InfraredClient.runAreaAndWait` when the run does not finish
 * within `areaTimeout` seconds.
 *
 * @category Errors
 */
export class AreaTimeoutError extends Error {
    /** The run's counts at the moment it timed out. */
    areaState;
    /**
     * @param message - The error message.
     * @param areaState - The run's counts at the moment it timed out.
     */
    constructor(message, areaState) {
        super(message);
        this.name = "AreaTimeoutError";
        this.areaState = areaState;
    }
}
