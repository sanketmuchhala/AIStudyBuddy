import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { fetchApi } from './api';

const server = setupServer(
  rest.get('/api/test', (req, res, ctx) => {
    return res(ctx.json({ message: 'success' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchApi', () => {
  it('should fetch data successfully', async () => {
    const data = await fetchApi('/test');
    expect(data).toEqual({ message: 'success' });
  });

  it('should handle errors', async () => {
    server.use(
      rest.get('/api/test', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await expect(fetchApi('/test')).rejects.toThrow('API request failed');
  });
});
