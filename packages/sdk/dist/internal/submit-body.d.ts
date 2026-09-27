interface BodyOptions {
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
}
/** Apply transport defaults to an explicitly wire-keyed payload, then pack it. */
export declare function prepareSubmissionBody(analysisType: string, payload: Readonly<Record<string, unknown>>, options: BodyOptions): Record<string, unknown>;
export {};
