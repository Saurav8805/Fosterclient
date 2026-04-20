const bcrypt = require('bcryptjs');

async function generateHashes() {
  const adminHash = await bcrypt.hash('foster@123', 10);
  const studentHash = await bcrypt.hash('default123', 10);
  
  console.log('\n=== PASSWORD HASHES ===\n');
  console.log('Admin/Faculty password (foster@123):');
  console.log(adminHash);
  console.log('\nStudent password (default123):');
  console.log(studentHash);
  console.log('\n======================\n');
}

generateHashes();
