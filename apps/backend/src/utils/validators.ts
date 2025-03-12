import { CreateTokenDto } from '../types/token.types';

/**
 * Validate Solana address
 * @param address Solana address to validate
 */
export function validateSolanaAddress(address: string): boolean {
  // Basic validation for Solana addresses
  // They are base58 encoded and typically 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Validate token metadata
 * @param data Token data to validate
 */
export function validateTokenMetadata(data: CreateTokenDto): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Token name is required');
  }

  if (!data.symbol || data.symbol.trim() === '') {
    errors.push('Token symbol is required');
  } else if (data.symbol.length > 10) {
    errors.push('Token symbol should be 10 characters or less');
  }

  if (!data.tokenAddress || data.tokenAddress.trim() === '') {
    errors.push('Token address is required');
  } else if (!validateSolanaAddress(data.tokenAddress)) {
    errors.push('Invalid Solana token address format');
  }

  // Optional fields validation
  if (data.description && data.description.length > 1000) {
    errors.push('Description should be 1000 characters or less');
  }

  if (data.supply !== undefined && (isNaN(data.supply) || data.supply <= 0)) {
    errors.push('Supply must be a positive number');
  }

  if (data.decimals !== undefined && (isNaN(data.decimals) || data.decimals < 0 || data.decimals > 18)) {
    errors.push('Decimals must be between 0 and 18');
  }

  // URL validations
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  if (data.logo && !urlRegex.test(data.logo)) {
    errors.push('Logo URL is invalid');
  }

  if (data.website && !urlRegex.test(data.website)) {
    errors.push('Website URL is invalid');
  }

  if (data.twitter && !urlRegex.test(data.twitter)) {
    errors.push('Twitter URL is invalid');
  }

  if (data.discord && !urlRegex.test(data.discord)) {
    errors.push('Discord URL is invalid');
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 