import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), '.data');
const TOKENS_FILE = join(DATA_DIR, 'password-recovery.json');
export const RECOVERY_TOKEN_TTL_MS = 30 * 60 * 1000;

type RecoveryToken = {
  userId: string;
  tokenHash: string;
  expiresAt: number;
  usedAt?: number;
};

let memoryTokens: RecoveryToken[] | null = null;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

function loadTokens(): RecoveryToken[] {
  if (memoryTokens) return memoryTokens;
  try {
    if (existsSync(TOKENS_FILE)) {
      const parsed: unknown = JSON.parse(readFileSync(TOKENS_FILE, 'utf8'));
      if (Array.isArray(parsed)) memoryTokens = parsed as RecoveryToken[];
    }
  } catch {
    // A corrupt token file is treated as empty; stale tokens must never be trusted.
  }
  return (memoryTokens ??= []);
}

function saveTokens(tokens: RecoveryToken[]): void {
  memoryTokens = tokens;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(TOKENS_FILE, JSON.stringify(tokens), { encoding: 'utf8', mode: 0o600 });
  } catch {
    // Keep the short-lived token in memory if the runtime filesystem is read-only.
  }
}

function pruneTokens(tokens: RecoveryToken[]): RecoveryToken[] {
  return tokens.filter((token) => !token.usedAt && token.expiresAt > Date.now());
}

export function createRecoveryToken(userId: string): string {
  const rawToken = randomBytes(32).toString('base64url');
  const tokens = pruneTokens(loadTokens()).filter((token) => token.userId !== userId);
  tokens.push({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: Date.now() + RECOVERY_TOKEN_TTL_MS,
  });
  saveTokens(tokens);
  return rawToken;
}

export function consumeRecoveryToken(rawToken: string): string | null {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(rawToken)) return null;
  const tokens = pruneTokens(loadTokens());
  const token = tokens.find((candidate) => candidate.tokenHash === hashToken(rawToken));
  if (!token) {
    saveTokens(tokens);
    return null;
  }
  token.usedAt = Date.now();
  saveTokens(tokens);
  return token.userId;
}
