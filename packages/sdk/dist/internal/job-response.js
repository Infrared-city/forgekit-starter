function requiredString(value) {
    if (typeof value !== "string" || value.length === 0) {
        throw new TypeError("invalid job response");
    }
    return value;
}
function optionalString(value) {
    return typeof value === "string" ? value : undefined;
}
function binaryAcknowledgement(value) {
    if (value === undefined)
        return undefined;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("invalid binary acknowledgement");
    }
    const raw = value;
    // `json`: an interior part on the binary route writes the JSON result
    // (D228). The submit path checks the value against the one it asked for.
    const resultFormat = raw.resultFormat;
    if (raw.inputFormat !== "irbf" || (resultFormat !== "irbf" && resultFormat !== "json")
        || raw.wireVersion !== 1) {
        throw new TypeError("invalid binary acknowledgement");
    }
    return { inputFormat: "irbf", resultFormat, wireVersion: 1,
        artifactDigest: requiredString(raw.artifactDigest),
        contentDigest: requiredString(raw.contentDigest) };
}
export function parseJobStatus(value) {
    switch (value.toLowerCase()) {
        case "pending": return "pending";
        case "running": return "running";
        case "succeeded":
        case "succeded": return "succeeded";
        case "failed": return "failed";
        default: return "unknown";
    }
}
export function jobFromResponse(input) {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError("invalid job response");
    }
    const value = input;
    const statusValue = value.jobStatus ?? value.status;
    if (statusValue !== undefined && statusValue !== null && typeof statusValue !== "string") {
        throw new TypeError("invalid job response");
    }
    const startedAt = optionalString(value.startedAt);
    const finishedAt = optionalString(value.finishedAt);
    const resultsUrl = optionalString(value.resultsUrl ?? value.results);
    const error = optionalString(value.error);
    const binary = binaryAcknowledgement(value.binary);
    return {
        jobId: requiredString(value.jobId),
        modelName: optionalString(value.modelName) ?? "",
        status: parseJobStatus(optionalString(statusValue) ?? "Unknown"),
        requestedAt: optionalString(value.requestedAt) ?? "",
        ...(startedAt === undefined ? {} : { startedAt }),
        ...(finishedAt === undefined ? {} : { finishedAt }),
        ...(resultsUrl === undefined ? {} : { resultsUrl }),
        ...(error === undefined ? {} : { error }),
        ...(binary === undefined ? {} : { binary }),
    };
}
