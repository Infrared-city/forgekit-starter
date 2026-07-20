import { api } from './api'

export type ApiKeyType = 'general' | 'payg'
export type ApiKeyAlgo = 'hmac-sha256' | 'aes-256-cbc'

export interface ApiKeyRecord {
  id: string
  name: string
  type: ApiKeyType
  algo: ApiKeyAlgo
  prefix: string
  createdAt: string
  lastUsedAt?: string
  revokedAt?: string | null
}

export interface ListApiKeysResponse {
  keys: ApiKeyRecord[]
}

export interface CreateApiKeyResponse {
  key: ApiKeyRecord
  /** Raw secret — returned ONCE at create. Never persisted server-side. */
  secret: string
}

export interface RenameApiKeyResponse {
  key: ApiKeyRecord
}

export function listApiKeys(): Promise<ListApiKeysResponse> {
  return api.get<ListApiKeysResponse>('/user/apikeys')
}

export function createApiKey(input: {
  name: string
  type: ApiKeyType
}): Promise<CreateApiKeyResponse> {
  return api.post<CreateApiKeyResponse>('/user/apikeys', input)
}

export function renameApiKey(id: string, name: string): Promise<RenameApiKeyResponse> {
  return api.patch<RenameApiKeyResponse>(`/user/apikeys/${id}`, { name })
}

export function revokeApiKey(id: string): Promise<void> {
  return api.delete<void>(`/user/apikeys/${id}`)
}
