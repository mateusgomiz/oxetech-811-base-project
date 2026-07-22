import { readDatabase, writeDatabase } from '../src/utils/database';
import fs from 'fs';

jest.mock('fs');

describe('Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('readDatabase deve ler arquivo JSON', () => {
    const mockData = { users: [], tickets: [], comments: [] };
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

    const result = readDatabase();
    expect(result).toEqual(mockData);
  });

  test('readDatabase deve retornar vazio se arquivo não existir', () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      const error = new Error('Not found') as any;
      error.code = 'ENOENT';
      throw error;
    });

    const result = readDatabase();
    expect(result).toEqual({ users: [], tickets: [], comments: [] });
  });

  test('writeDatabase deve escrever arquivo', () => {
    const mockData = { users: [], tickets: [], comments: [] };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    writeDatabase(mockData);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});