import {
  HttpClient
} from "./chunk-HHRINQ6B.js";
import {
  InfraredError
} from "./chunk-GOADVAJS.js";

// src/webhooks/types.ts
var WEBHOOK_EVENT_RUNNING = "job.running";
var WEBHOOK_EVENT_SUCCEEDED = "job.succeeded";
var WEBHOOK_EVENT_FAILED = "job.failed";
var WebhookError = class extends InfraredError {
  constructor(message) {
    super(message);
    this.name = "WebhookError";
  }
};
var WebhookRegistrationError = class extends WebhookError {
  constructor(message) {
    super(message);
    this.name = "WebhookRegistrationError";
  }
};
var WebhookNotFoundError = class extends WebhookError {
  constructor(message) {
    super(message);
    this.name = "WebhookNotFoundError";
  }
};
function asStringOrUndefined(v) {
  return typeof v === "string" ? v : void 0;
}
function webhookEndpointFromResponse(data) {
  const id = asStringOrUndefined(data.id);
  const url = asStringOrUndefined(data.url);
  const type = asStringOrUndefined(data.type);
  if (!id || !url || !type) {
    throw new Error(
      `webhookEndpointFromResponse: missing required field(s) id=${typeof data.id}, url=${typeof data.url}, type=${typeof data.type}`
    );
  }
  return {
    id,
    url,
    type,
    createdAt: asStringOrUndefined(data.createdAt),
    updatedAt: asStringOrUndefined(data.updatedAt)
  };
}

// src/webhooks/service.ts
var WebhooksService = class {
  httpClient;
  logger;
  constructor(config) {
    this.httpClient = new HttpClient({
      getAuthHeaders: config.getAuthHeaders,
      baseUrl: config.baseUrl,
      logger: config.logger,
      timeout: config.timeout,
      maxRetries: config.maxRetries
    });
    this.logger = config.logger;
  }
  // -- CRUD methods ---------------------------------------------------------
  /**
   * Register a new webhook endpoint.
   *
   * @param url - The URL to receive webhook events.
   * @param type - Endpoint type ("production" or "development").
   * @param ip - Optional IP address filter.
   * @returns The newly created endpoint.
   * @throws WebhookRegistrationError if the request fails.
   */
  async register(url, type, ip) {
    const payload = { url, type };
    if (ip !== void 0) {
      payload.ip = ip;
    }
    this.logger.debug(`POST /webhooks (url=${url}, type=${type})`);
    try {
      const data = await this.httpClient.post("/webhooks", payload, {
        serializeNames: false
      });
      return webhookEndpointFromResponse(data);
    } catch (error) {
      throw new WebhookRegistrationError(
        `Failed to register webhook: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  /**
   * List all webhook endpoints.
   *
   * @returns All registered endpoints.
   * @throws WebhookError if the request fails.
   */
  async list() {
    this.logger.debug("GET /webhooks");
    try {
      const data = await this.httpClient.get("/webhooks");
      return data.map(webhookEndpointFromResponse);
    } catch (error) {
      throw new WebhookError(
        `Failed to list webhooks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  /**
   * Get a specific webhook endpoint by ID.
   *
   * @param endpointId - The ID of the endpoint to retrieve.
   * @returns The requested endpoint.
   * @throws WebhookNotFoundError if the endpoint is not found (404).
   * @throws WebhookError if the request fails for other reasons.
   */
  async get(endpointId) {
    this.logger.debug(`GET /webhooks/${endpointId}`);
    try {
      const data = await this.httpClient.get(`/webhooks/${endpointId}`);
      return webhookEndpointFromResponse(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isHttpStatus(msg, 404)) {
        throw new WebhookNotFoundError(`Webhook endpoint not found: ${endpointId}`);
      }
      throw new WebhookError(`Failed to get webhook ${endpointId}: ${msg}`);
    }
  }
  /**
   * Delete a webhook endpoint by ID.
   *
   * @param endpointId - The ID of the endpoint to delete.
   * @throws WebhookNotFoundError if the endpoint is not found (404).
   * @throws WebhookError if the request fails for other reasons.
   */
  async delete(endpointId) {
    this.logger.debug(`DELETE /webhooks/${endpointId}`);
    try {
      await this.httpClient.delete(`/webhooks/${endpointId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isHttpStatus(msg, 404)) {
        throw new WebhookNotFoundError(`Webhook endpoint not found: ${endpointId}`);
      }
      throw new WebhookError(`Failed to delete webhook ${endpointId}: ${msg}`);
    }
  }
  // -- Signature verification -----------------------------------------------
  /**
   * Verify a Standard Webhooks HMAC-SHA256 signature.
   *
   * Validates that the signature in the `webhook-signature` header matches
   * the expected HMAC for the given payload, and that the timestamp is
   * within the tolerance window (replay protection).
   *
   * Uses `crypto.subtle` for HMAC computation (isomorphic: browser, Node,
   * CF Workers) and a double-HMAC pattern for timing-safe comparison
   * (no dependency on `crypto.timingSafeEqual`).
   *
   * @param payloadBody - The raw request body (bytes or string).
   * @param headers - Request headers containing `webhook-id`, `webhook-timestamp`, and `webhook-signature`.
   * @param secret - The webhook secret (`"whsec_"` prefixed, base64-encoded).
   * @param tolerance - Maximum age of the timestamp in seconds (default 300). Set to 0 to disable replay protection.
   * @returns `true` if the signature is valid and the timestamp is within tolerance.
   */
  async verifySignature(payloadBody, headers, secret, tolerance = 300) {
    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }
    const webhookId = normalizedHeaders["webhook-id"];
    const webhookTimestamp = normalizedHeaders["webhook-timestamp"];
    const webhookSignature = normalizedHeaders["webhook-signature"];
    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return false;
    }
    if (tolerance > 0) {
      const ts = Number.parseInt(webhookTimestamp, 10);
      if (Number.isNaN(ts)) {
        return false;
      }
      const now = Math.floor(Date.now() / 1e3);
      if (Math.abs(now - ts) > tolerance) {
        return false;
      }
    }
    const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    let keyBytes;
    try {
      keyBytes = base64Decode(rawSecret);
    } catch {
      return false;
    }
    let bodyBytes;
    if (typeof payloadBody === "string") {
      bodyBytes = new TextEncoder().encode(payloadBody);
    } else {
      bodyBytes = payloadBody;
    }
    const prefixBytes = new TextEncoder().encode(`${webhookId}.${webhookTimestamp}.`);
    const signedContent = new Uint8Array(prefixBytes.length + bodyBytes.length);
    signedContent.set(prefixBytes, 0);
    signedContent.set(bodyBytes, prefixBytes.length);
    let cryptoKey;
    try {
      cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes.buffer,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
    } catch {
      return false;
    }
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, signedContent);
    const expectedSig = base64Encode(new Uint8Array(signatureBuffer));
    for (const sigEntry of webhookSignature.split(" ")) {
      const commaIdx = sigEntry.indexOf(",");
      if (commaIdx === -1) {
        continue;
      }
      const version = sigEntry.slice(0, commaIdx);
      const sigValue = sigEntry.slice(commaIdx + 1);
      if (version === "v1") {
        const isEqual = await timingSafeEqual(expectedSig, sigValue);
        if (isEqual) {
          return true;
        }
      }
    }
    return false;
  }
};
function isHttpStatus(message, status) {
  return message.startsWith(`HTTP ${status}:`);
}
function base64Decode(encoded) {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function base64Encode(bytes) {
  const CHUNK_SIZE = 8192;
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    const slice = bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, bytes.length));
    chunks.push(String.fromCharCode.apply(null, slice));
  }
  return btoa(chunks.join(""));
}
async function timingSafeEqual(a, b) {
  const randomKeyBytes = new Uint8Array(32);
  crypto.getRandomValues(randomKeyBytes);
  const key = await crypto.subtle.importKey(
    "raw",
    randomKeyBytes.buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const encoder = new TextEncoder();
  const [hmacA, hmacB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b))
  ]);
  const viewA = new Uint8Array(hmacA);
  const viewB = new Uint8Array(hmacB);
  if (viewA.length !== viewB.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < viewA.length; i++) {
    diff |= viewA[i] ^ viewB[i];
  }
  return diff === 0;
}

export {
  WEBHOOK_EVENT_RUNNING,
  WEBHOOK_EVENT_SUCCEEDED,
  WEBHOOK_EVENT_FAILED,
  WebhookError,
  WebhookRegistrationError,
  WebhookNotFoundError,
  webhookEndpointFromResponse,
  WebhooksService
};
//# sourceMappingURL=chunk-2S7HYD2Z.js.map