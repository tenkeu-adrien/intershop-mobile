/**
 * Firebase Configuration - DISABLED
 * 
 * Firebase is NOT used in intershop-mobile.
 * All data comes from the alibaba-clone API backend.
 * 
 * This file exists only for compatibility with existing imports.
 * DO NOT initialize Firebase here!
 */

// Export null values for compatibility
export const db = null as any;
export const storage = null as any;
export const auth = null as any;

export const getDbInstance = () => null as any;
export const getStorageInstance = () => null as any;
export const getAuthInstance = () => null as any;

export default null as any;

console.log('⚠️ Firebase is DISABLED in intershop-mobile. Using API backend instead.');
