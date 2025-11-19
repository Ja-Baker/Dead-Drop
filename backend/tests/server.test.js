const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDataPath = path.join(os.tmpdir(), `dead-drop-test-${process.pid}-${Date.now()}.json`);
process.env.DATA_FILE_PATH = tempDataPath;

const request = require('supertest');
const { app } = require('../server');

const cleanup = () => {
  if (fs.existsSync(tempDataPath)) {
    fs.unlinkSync(tempDataPath);
  }
};

test.after(cleanup);

test('GET / exposes the brutal heartbeat message', async () => {
  const response = await request(app).get('/').expect(200);
  assert.ok(response.body.message.includes('Dead Drop API'));
  assert.ok(Array.isArray(response.body.endpoints));
});

test('signup/login flows persist data to the configured store', async () => {
  const payload = {
    email: `ci-${Date.now()}@dead.drop`,
    password: 'skeleton-key',
    name: 'CI Ghost'
  };

  const signup = await request(app).post('/api/auth/signup').send(payload).expect(200);
  assert.ok(signup.body.token, 'signup returns a session token');

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: payload.email, password: payload.password })
    .expect(200);

  assert.ok(login.body.token, 'login returns a session token');
});
