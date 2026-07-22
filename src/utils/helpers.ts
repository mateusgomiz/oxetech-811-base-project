import type { TicketPriority } from '../types';

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function calculatePriority(category: string, description: string): TicketPriority {
  const text = description.toLowerCase();

  switch (true) {
    case category === 'infra':
    case text.includes('urgente'):
    case text.includes('urgent'):
      return 'urgent';

    case category === 'sistemas':
    case description.length > 220:
      return 'high';

    case category === 'academico':
      return 'medium';

    default:
      return 'low';
  }
}

export function getCurrentTimestamp(): string { return new Date().toISOString(); }