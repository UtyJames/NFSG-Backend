/**
 * Generates a sequential-style registration ID.
 * Format: PREFIX/YEAR/XXXXXX (6-digit zero-padded random number)
 * The real uniqueness is enforced by the database @unique constraint.
 */
export function generateId(prefix: string, year: number = new Date().getFullYear()): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}/${year}/${rand}`;
}

/**
 * Generates a short alphanumeric verification code (8 chars, uppercase).
 * Used for public status checks without exposing the full member ID.
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generates a supplier ID: NFSG-SUP/YEAR/XXXX
 */
export function generateSupplierId(year: number = new Date().getFullYear()): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NFSG-SUP/${year}/${rand}`;
}

/**
 * Generates a distributor ID: NFSG-DIST/YEAR/XXXX
 */
export function generateDistributorId(year: number = new Date().getFullYear()): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NFSG-DIST/${year}/${rand}`;
}

/**
 * Generates an LGA coordinator ID: NFSG-LGA/YEAR/XXXX
 */
export function generateLgaCoordinatorId(year: number = new Date().getFullYear()): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NFSG-LGA/${year}/${rand}`;
}
