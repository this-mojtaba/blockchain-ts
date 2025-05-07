import { ENV, IStatus } from '@ServerTypes';
import { describe, it, expect } from 'bun:test';
import request from 'supertest';

const serverUrl = `http://localhost:${ENV.port}`;

describe('Ping Pong Test', () => {
  it('returns 200 status', async () => {
    const response = await request(serverUrl).get('/ping');

    expect(response.status).toBe(200);
  });
  it('returns success status in response body', async () => {
    const response = await request(serverUrl).get('/ping');

    expect(response.body.status).toBe(IStatus.success);
  });
  it('returns pong text in response body', async () => {
    const response = await request(serverUrl).get('/ping');

    expect(response.body.data).toBe('pong');
  });
});
