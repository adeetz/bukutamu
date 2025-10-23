console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('\nUser from connection string:');
const match = process.env.DATABASE_URL?.match(/postgresql:\/\/([^:]+):/);
if (match) {
  console.log('  ->', match[1]);
}
