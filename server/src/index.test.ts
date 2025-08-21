import app from './index';
import request from 'supertest';

describe('GET /healthz', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
