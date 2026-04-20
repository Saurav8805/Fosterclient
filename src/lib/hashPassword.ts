import bcrypt from 'bcryptjs';

// Utility to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Utility to verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate hashes for our test users
async function generateTestHashes() {
  const adminHash = await hashPassword('foster@123');
  const studentHash = await hashPassword('default123');
  
  console.log('Admin/Faculty password hash (foster@123):', adminHash);
  console.log('Student password hash (default123):', studentHash);
}

// Uncomment to generate hashes
// generateTestHashes();
