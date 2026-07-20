/**
 * Convert an IFC GlobalId (22-character base-64 encoded string) to a
 * standard UUID string (8-4-4-4-12 format).
 *
 * IFC uses a custom base-64 encoding for GlobalIds. The 22-character string
 * encodes a 128-bit value which is the same value as a standard UUID, just
 * represented differently.
 *
 * Algorithm:
 * 1. Decode each character from the IFC base-64 alphabet to a 6-bit value
 * 2. Combine all bits into a single 128-bit BigInt
 * 3. Format the BigInt as a UUID string (8-4-4-4-12 hex)
 *
 * @param globalId - 22-character IFC GlobalId string
 * @returns Standard UUID string (lowercase, 8-4-4-4-12 format)
 * @throws Error if the globalId is not exactly 22 characters
 */
export function ifcGlobalIdToUuid(globalId: string): string {
  if (globalId.length !== 22) {
    throw new Error(`IFC GlobalId must be 22 characters, got ${globalId.length}: "${globalId}"`)
  }

  // IFC base-64 character set (different from standard base-64)
  const IFC_BASE64_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'

  // Build lookup table for character -> 6-bit value
  const charToValue = new Map<string, bigint>()
  for (let i = 0; i < IFC_BASE64_CHARS.length; i++) {
    charToValue.set(IFC_BASE64_CHARS[i], BigInt(i))
  }

  // Decode the 22-character string into a 128-bit BigInt.
  // First character encodes only 2 bits (2 + 21*6 = 128 bits total).
  let num = BigInt(0)

  const firstVal = charToValue.get(globalId[0])
  if (firstVal === undefined) {
    throw new Error(`Invalid IFC base-64 character: "${globalId[0]}"`)
  }
  // First character: only 2 bits (mask to 2 bits)
  num = firstVal & 3n

  for (let i = 1; i < 22; i++) {
    const val = charToValue.get(globalId[i])
    if (val === undefined) {
      throw new Error(`Invalid IFC base-64 character: "${globalId[i]}"`)
    }
    num = (num << 6n) | val
  }

  // Format as UUID hex string (32 hex digits, padded with leading zeros)
  const hex = num.toString(16).padStart(32, '0')

  // Insert hyphens: 8-4-4-4-12
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

/**
 * Format an IFC type name for display.
 *
 * Strips the "IFC" prefix and converts PascalCase to Title Case.
 * Duplicated here to avoid a dependency on the interior domain.
 *
 * @param type - IFC entity type e.g. "IFCBUILDINGSTOREY"
 * @returns Formatted name e.g. "Building Storey"
 */
export function formatIfcTypeName(type: string): string {
  // Remove IFC prefix (case-insensitive)
  let name = type.replace(/^IFC/i, '')
  // Insert spaces before uppercase letters (PascalCase -> Title Case)
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Capitalize first letter of each word
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}
