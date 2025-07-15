const request = require('supertest');
const app = require('./app').default;
const axios = require('axios');

jest.mock('axios');
const mockedAxios = axios;

describe('POST /api/extension/data', () => {
  it('správně přemapuje odpověď z externího serveru', async () => {
    const mockResponse = [
      {
        text: 'Test text',
        top_label: 'CyberCoders Job Application',
        top_score: 0.018726,
        predictions: [
          { label: 'CyberCoders Job Application', score: 0.018726 },
          { label: 'Project Manager', score: 0.009635 }
        ]
      }
    ];
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const res = await request(app)
      .post('/api/extension/data')
      .send({ url: 'http://example.com', textContent: 'Test text' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toEqual({
      position: 'CyberCoders Job Application',
      score: 0.018726,
      location: '',
      selected: false
    });
  });
}); 