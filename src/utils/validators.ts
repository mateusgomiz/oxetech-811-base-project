export function validateCreateTicket(body: any): string[] {
  const required = ['title', 'description', 'category', 'requesterId'];
  return required.filter(field => !body[field]);
}

export function isValidStatus(status: string): boolean {
  return ['open', 'in_progress', 'resolved', 'closed'].includes(status);
}

export function isUserValid(user: any): boolean {
  return user && typeof user === 'object' && user.id;
}

export function validateStatusUpdate(body: any): string[] {
  const errors: string[] = [];

  if (!body.status) {
    errors.push('status');
  }

  if (body.status === 'closed' && !body.comment) {
    errors.push('comment');
  }

  if (body.status && !isValidStatus(body.status)) {
    errors.push('status');
  }

  if (body.status === 'closed' && !body.comment) {
    errors.push('comment');
  }

  
  return errors;
}