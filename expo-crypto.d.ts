declare module 'expo-crypto' {
  export function getRandomBytesAsync(byteCount: number): Promise<Uint8Array>;
  export function digestStringAsync(
    algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512',
    data: string
  ): Promise<string>;
}
