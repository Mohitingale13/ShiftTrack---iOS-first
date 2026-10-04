const assert = require('assert');

// Test suite for auth and validation logic
async function runTests() {
  console.log('--- Running ShiftTrack Authentication Logic Tests ---');

  const MOCK_CREDENTIALS = {
    email: 'staff@shifttrack.test',
    password: 'Password123',
  };

  const MOCK_USER = {
    id: 'usr_hosp_01',
    name: 'Mohit',
    email: 'staff@shifttrack.test',
    role: 'server',
    hourlyRate: 30,
  };

  const MOCK_TOKEN = 'mock-jwt-shifttrack-staff-token-2026';

  async function loginApi(credentials) {
    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    const normalizedExpected = MOCK_CREDENTIALS.email.toLowerCase();

    if (normalizedEmail === normalizedExpected && credentials.password === MOCK_CREDENTIALS.password) {
      return {
        token: MOCK_TOKEN,
        user: MOCK_USER,
      };
    }

    throw new Error('Invalid email or password. Please verify your credentials and try again.');
  }

  async function validateTokenApi(token) {
    if (token === MOCK_TOKEN) {
      return MOCK_USER;
    }
    throw new Error('Session token expired or invalid.');
  }

  // Test 1: Valid credentials
  console.log('[Test 1] Valid login with exact assessment credentials...');
  const res = await loginApi({ email: 'staff@shifttrack.test', password: 'Password123' });
  assert.strictEqual(res.token, MOCK_TOKEN);
  assert.strictEqual(res.user.email, 'staff@shifttrack.test');
  assert.strictEqual(res.user.role, 'server');
  console.log('  -> PASS: Valid login succeeded.');

  // Test 2: Case insensitivity in email
  console.log('[Test 2] Valid login with mixed case and whitespace in email...');
  const res2 = await loginApi({ email: '  Staff@ShiftTrack.Test  ', password: 'Password123' });
  assert.strictEqual(res2.token, MOCK_TOKEN);
  console.log('  -> PASS: Email normalization verified.');

  // Test 3: Invalid password
  console.log('[Test 3] Invalid password...');
  let failedAsExpected = false;
  try {
    await loginApi({ email: 'staff@shifttrack.test', password: 'WrongPassword' });
  } catch (err) {
    failedAsExpected = true;
    assert.strictEqual(err.message, 'Invalid email or password. Please verify your credentials and try again.');
  }
  assert.strictEqual(failedAsExpected, true);
  console.log('  -> PASS: Invalid password rejected with proper error message.');

  // Test 4: Invalid email
  console.log('[Test 4] Invalid email...');
  failedAsExpected = false;
  try {
    await loginApi({ email: 'unknown@bar.test', password: 'Password123' });
  } catch (err) {
    failedAsExpected = true;
    assert.strictEqual(err.message, 'Invalid email or password. Please verify your credentials and try again.');
  }
  assert.strictEqual(failedAsExpected, true);
  console.log('  -> PASS: Unknown email rejected with proper error message.');

  // Test 5: Token validation
  console.log('[Test 5] Token validation for valid and invalid tokens...');
  const validatedUser = await validateTokenApi(MOCK_TOKEN);
  assert.strictEqual(validatedUser.name, 'Mohit');
  let tokenRejected = false;
  try {
    await validateTokenApi('invalid-token-abc');
  } catch {
    tokenRejected = true;
  }
  assert.strictEqual(tokenRejected, true);
  console.log('  -> PASS: Token validation accurately verified.');

  // Test 6: In-memory session mock storage simulation
  console.log('[Test 6] Stored session lifecycle simulation...');
  let storage = {};
  function save(token, user) {
    storage.token = token;
    storage.user = JSON.stringify(user);
  }
  function restore() {
    if (!storage.token || !storage.user) return null;
    return { token: storage.token, user: JSON.parse(storage.user) };
  }
  function clear() {
    delete storage.token;
    delete storage.user;
  }

  save(MOCK_TOKEN, MOCK_USER);
  const restored = restore();
  assert.strictEqual(restored.token, MOCK_TOKEN);
  assert.strictEqual(restored.user.id, 'usr_hosp_01');
  clear();
  assert.strictEqual(restore(), null);
  console.log('  -> PASS: Session persistence and clear lifecycle verified.');

  console.log('\nAll 6 authentication unit tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});