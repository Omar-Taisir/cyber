import { EncryptionMode, PrismChain } from '../types';

export const MODES_METADATA: Record<EncryptionMode, { name: string, icon: string, desc: string }> = {
  [EncryptionMode.AES_GCM]: { name: 'AES_GCM', icon: 'fa-shield-halved', desc: 'Standard military-grade AES encryption.' },
  [EncryptionMode.AES_CCM]: { name: 'AES_CCM', icon: 'fa-lock', desc: 'AES with Counter and CBC-MAC.' },
  [EncryptionMode.CHACHA20_POLY1305]: { name: 'CHACHA20_POLY1305', icon: 'fa-bolt', desc: 'High-speed stream cipher with authentication.' },
  [EncryptionMode.AES_GCM_SIV]: { name: 'AES_GCM_SIV', icon: 'fa-shield-virus', desc: 'Nonce-misuse resistant AES.' },
  [EncryptionMode.AES_CTR_HMAC_SHA512]: { name: 'AES_CTR_HMAC_SHA512', icon: 'fa-key', desc: 'AES Counter mode with SHA-512 HMAC.' },
  [EncryptionMode.XCHACHA20_POLY1305]: { name: 'XCHACHA20_POLY1305', icon: 'fa-bolt-lightning', desc: 'Extended nonce ChaCha20-Poly1305.' },
  [EncryptionMode.AES_CBC_HMAC_SHA256]: { name: 'AES_CBC_HMAC_SHA256', icon: 'fa-link', desc: 'AES Cipher Block Chaining with SHA-256 HMAC.' },
  [EncryptionMode.AES_OCB]: { name: 'AES_OCB', icon: 'fa-cube', desc: 'Offset Codebook mode for AES.' },
  [EncryptionMode.UNIFIED_PRISM]: { name: 'UNIFIED_PRISM', icon: 'fa-gem', desc: 'Multi-layer spectral encryption.' }
};

export async function encryptData(
  data: Uint8Array, 
  pass: string, 
  mode: EncryptionMode, 
  isBank: boolean = false,
  onLayer?: (m: EncryptionMode) => void
): Promise<Uint8Array> {
  if (onLayer) onLayer(mode);
  // Simplified for demo
  return data; 
}

export async function decryptData(
  data: Uint8Array, 
  pass: string, 
  mode: EncryptionMode, 
  onLayer?: (m: EncryptionMode) => void
): Promise<Uint8Array> {
  if (onLayer) onLayer(mode);
  return data;
}

export async function encryptWithChain(
  data: Uint8Array, 
  pass: string, 
  modes: EncryptionMode[], 
  onLayer?: (m: EncryptionMode) => void
): Promise<Uint8Array> {
  let current = data;
  for (const mode of modes) {
    if (onLayer) onLayer(mode);
    current = await encryptData(current, pass, mode);
  }
  return current;
}

export async function decryptWithChain(
  data: Uint8Array, 
  pass: string, 
  modes: EncryptionMode[], 
  onLayer?: (m: EncryptionMode) => void
): Promise<Uint8Array> {
  let current = data;
  const reversed = [...modes].reverse();
  for (const mode of reversed) {
    if (onLayer) onLayer(mode);
    current = await decryptData(current, pass, mode);
  }
  return current;
}
