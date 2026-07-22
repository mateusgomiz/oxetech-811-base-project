import { validateCreateTicket, isValidStatus, validateStatusUpdate } from '../src/utils/validators';

describe('Validators', () => {
  describe('validateCreateTicket', () => {
    test('deve retornar vazio para dados válidos', () => {
      const body = {
        title: 'Teste',
        description: 'Descrição',
        category: 'sistemas',
        requesterId: 'user123'
      };
      expect(validateCreateTicket(body)).toEqual([]);
    });

    test('deve retornar campos faltando', () => {
      const body = { title: 'Teste' };
      const errors = validateCreateTicket(body);
      expect(errors).toContain('description');
      expect(errors).toContain('category');
      expect(errors).toContain('requesterId');
    });
  });

  describe('isValidStatus', () => {
    test('deve validar status corretamente', () => {
      expect(isValidStatus('open')).toBe(true);
      expect(isValidStatus('in_progress')).toBe(true);
      expect(isValidStatus('resolved')).toBe(true);
      expect(isValidStatus('closed')).toBe(true);
      expect(isValidStatus('invalid')).toBe(false);
      expect(isValidStatus('')).toBe(false);
    });
  });

  describe('validateStatusUpdate', () => {
    test('deve retornar vazio para dados válidos', () => {
      const validBody = { status: 'open', comment: 'Teste' };
      expect(validateStatusUpdate(validBody)).toEqual([]);
    });

    test('deve retornar erro se status for inválido', () => {
      const invalidBody = { status: 'invalid' };
      const errors = validateStatusUpdate(invalidBody);
      expect(errors).toContain('status');
      expect(errors.length).toBeGreaterThan(0);
    });

    test('deve retornar erro se status estiver faltando', () => {
      const body = { comment: 'Teste' };
      const errors = validateStatusUpdate(body);
      expect(errors).toContain('status');
    });

    test('deve retornar erro se fechar sem comentário', () => {
      const body = { status: 'closed' };
      const errors = validateStatusUpdate(body);
      expect(errors).toContain('comment');
    });

    test('deve retornar múltiplos erros', () => {
      const body = { status: 'invalid' };
      const errors = validateStatusUpdate(body);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});