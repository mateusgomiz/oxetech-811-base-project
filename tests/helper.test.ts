import { generateId, calculatePriority, getCurrentTimestamp } from '../src/utils/helpers';

describe('Helpers', () => {
  test('generateId deve criar ID com prefixo', () => {
    const id = generateId('ticket');
    expect(id).toMatch(/^ticket_\d+_\d+$/);
  });

  test('generateId deve criar IDs diferentes', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');
    expect(id1).not.toBe(id2);
  });

  test('calculatePriority deve retornar urgent para infra', () => {
    expect(calculatePriority('infra', 'teste')).toBe('urgent');
  });

  test('calculatePriority deve retornar urgent para descrição com urgente', () => {
    expect(calculatePriority('teste', 'Isso é urgente!')).toBe('urgent');
    expect(calculatePriority('teste', 'This is urgent!')).toBe('urgent');
  });

  test('calculatePriority deve retornar high para sistemas', () => {
    expect(calculatePriority('sistemas', 'teste')).toBe('high');
  });

  test('calculatePriority deve retornar high para descrição longa', () => {
    const longText = 'a'.repeat(221);
    expect(calculatePriority('teste', longText)).toBe('high');
  });

  test('calculatePriority deve retornar medium para academico', () => {
    expect(calculatePriority('academico', 'teste')).toBe('medium');
  });

  test('calculatePriority deve retornar low para outros casos', () => {
    expect(calculatePriority('outro', 'teste normal')).toBe('low');
  });

  test('getCurrentTimestamp deve retornar ISO válido', () => {
    const timestamp = getCurrentTimestamp();
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});