import { api } from './api'

export interface WebhookSecretMetadata {
  prefix: string
  createdAt: string
  lastRotatedAt?: string
}

export interface GetWebhookSecretResponse {
  secret: WebhookSecretMetadata | null
}

export interface CreateOrRotateWebhookSecretResponse {
  secret: WebhookSecretMetadata
  /** Raw secret — returned ONCE at create / rotate. Never persisted client-side. */
  raw: string
}

export function getWebhookSecret(): Promise<GetWebhookSecretResponse> {
  return api.get<GetWebhookSecretResponse>('/user/webhook-secret')
}

export function createWebhookSecret(): Promise<CreateOrRotateWebhookSecretResponse> {
  return api.post<CreateOrRotateWebhookSecretResponse>('/user/webhook-secret', {})
}

export function rotateWebhookSecret(): Promise<CreateOrRotateWebhookSecretResponse> {
  return api.post<CreateOrRotateWebhookSecretResponse>('/user/webhook-secret/rotate', {})
}

export function revokeWebhookSecret(): Promise<void> {
  return api.delete<void>('/user/webhook-secret')
}
