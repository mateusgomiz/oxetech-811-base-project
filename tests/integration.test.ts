import request from 'supertest';
import app from '../src/server';

describe('API Integration Tests', () => {
  test('GET /api/health deve retornar status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'oxetech-helpdesk');
  });

  test('GET /api/users deve listar usuários', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/users/:id deve retornar usuário específico', async () => {
    const response = await request(app).get('/api/users/user_ana');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'user_ana');
  });

  test('GET /api/users/:id deve retornar 404 para usuário inexistente', async () => {
    const response = await request(app).get('/api/users/inexistente');
    expect(response.status).toBe(404);
  });

  test('POST /api/tickets deve criar ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Ticket Teste Integração',
        description: 'Descrição teste',
        category: 'sistemas',
        requesterId: 'user_ana'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status', 'open');
  });

  test('GET /api/tickets deve listar tickets', async () => {
    const response = await request(app).get('/api/tickets');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('deve retornar 404 para rota inexistente', async () => {
    const response = await request(app).get('/api/rota-inexistente');
    expect(response.status).toBe(404);
  });
});