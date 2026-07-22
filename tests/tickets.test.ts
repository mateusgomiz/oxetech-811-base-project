import request from 'supertest';
import express from 'express';
import ticketsRoutes from '../src/routes/tickets';
import * as database from '../src/utils/database';
import * as helpers from '../src/utils/helpers';

jest.mock('../src/utils/database');
jest.mock('../src/utils/helpers');

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketsRoutes);

describe('Tickets API', () => {
  const mockTicket = {
    id: 'ticket_001',
    title: 'Teste Ticket',
    description: 'Descrição',
    category: 'sistemas',
    status: 'open',
    priority: 'high',
    requesterId: 'user_ana',
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z'
  };

  const mockDb = {
    users: [
      { id: 'user_ana', name: 'Ana', email: 'ana@test.com', role: 'student', password: '123' }
    ],
    tickets: [mockTicket],
    comments: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (database.readDatabase as jest.Mock).mockReturnValue(mockDb);
    (helpers.generateId as jest.Mock).mockReturnValue('ticket_002');
    (helpers.getCurrentTimestamp as jest.Mock).mockReturnValue('2026-07-22T11:00:00.000Z');
  });

  test('GET /api/tickets deve listar tickets', async () => {
    const response = await request(app).get('/api/tickets');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('ticket_001');
  });

  test('GET /api/tickets deve filtrar por status', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ status: 'open' });
    expect(response.status).toBe(200);
    expect(response.body[0].status).toBe('open');
  });

  test('GET /api/tickets deve filtrar por categoria', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ category: 'sistemas' });
    expect(response.status).toBe(200);
    expect(response.body[0].category).toBe('sistemas');
  });

  test('GET /api/tickets deve buscar por texto', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ search: 'Teste' });
    expect(response.status).toBe(200);
    expect(response.body[0].title).toContain('Teste');
  });

  test('GET /api/tickets/summary deve retornar resumo', async () => {
    const response = await request(app).get('/api/tickets/summary');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('open');
    expect(response.body).toHaveProperty('closed');
    expect(response.body).toHaveProperty('urgent');
  });

  test('GET /api/tickets/:id deve retornar ticket por ID', async () => {
    const response = await request(app).get('/api/tickets/ticket_001');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('ticket_001');
  });

  test('GET /api/tickets/:id deve retornar 404 se não existir', async () => {
    const response = await request(app).get('/api/tickets/inexistente');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ticket nao encontrado');
  });

  test('POST /api/tickets deve criar novo ticket', async () => {
    const newTicket = {
      title: 'Novo Ticket',
      description: 'Descrição',
      category: 'infra',
      requesterId: 'user_ana'
    };

    const response = await request(app)
      .post('/api/tickets')
      .send(newTicket);
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBe('ticket_002');
  });

  test('POST /api/tickets deve retornar 400 se faltar campos', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({ title: 'Apenas título' });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Campos obrigatorios');
  });

  test('POST /api/tickets deve retornar 400 se solicitante inválido', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Teste',
        description: 'Desc',
        category: 'sistemas',
        requesterId: 'invalido'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Solicitante invalido');
  });

  test('PATCH /api/tickets/:id/status deve atualizar status', async () => {
    const response = await request(app)
      .patch('/api/tickets/ticket_001/status')
      .send({
        status: 'closed',
        comment: 'Resolvido',
        authorId: 'user_ana'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('closed');
  });

  test('PATCH /api/tickets/:id/status deve retornar 404 se ticket não existe', async () => {
    const response = await request(app)
      .patch('/api/tickets/inexistente/status')
      .send({ status: 'closed' });
    
    expect(response.status).toBe(404);
  });

  test('PATCH /api/tickets/:id/status deve retornar 400 se status inválido', async () => {
    const response = await request(app)
      .patch('/api/tickets/ticket_001/status')
      .send({ status: 'invalid' });
    
    expect(response.status).toBe(400);
  });

  test('PATCH /api/tickets/:id/status deve exigir comentário para fechar', async () => {
    const response = await request(app)
      .patch('/api/tickets/ticket_001/status')
      .send({ status: 'closed' });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Comentário obrigatório');
  });

  test('POST /api/tickets/:id/comments deve adicionar comentário', async () => {
    const response = await request(app)
      .post('/api/tickets/ticket_001/comments')
      .send({
        message: 'Comentário teste',
        authorId: 'user_ana'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Comentário teste');
  });

  test('POST /api/tickets/:id/comments deve retornar 404 se ticket não existe', async () => {
    const response = await request(app)
      .post('/api/tickets/inexistente/comments')
      .send({ message: 'Teste', authorId: 'user_ana' });
    
    expect(response.status).toBe(404);
  });

  test('POST /api/tickets/:id/comments deve retornar 400 se faltar campos', async () => {
    const response = await request(app)
      .post('/api/tickets/ticket_001/comments')
      .send({ message: 'Teste' });
    
    expect(response.status).toBe(400);
  });
});