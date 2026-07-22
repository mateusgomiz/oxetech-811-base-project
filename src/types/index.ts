export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type UserRole = "student" | "teacher" | "support";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface Ticket {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  requesterId: string;
  status: TicketStatus;
  assignedToId?: string;
  priority: TicketPriority;
}

export interface Comment {
  id: string;
  message: string;
  ticketId: string;
  authorId: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  tickets: Ticket[];
  comments: Comment[];
}