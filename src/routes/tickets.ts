import { Router } from "express";
import { Ticket } from "../types";
import { calculatePriority, generateId } from "../utils/helpers";
import { validateStatusUpdate } from "../utils/validators";
import { readDatabase, writeDatabase } from "../utils/database";

const router = Router();

router.get("/", (request, response) => {
  const database = readDatabase();
  let tickets = database.tickets;

  if (request.query.status) {
    tickets = tickets.filter((ticket) => ticket.status === request.query.status);
  }

  if (request.query.category) {
    tickets = tickets.filter((ticket) => ticket.category === request.query.category);
  }

  if (request.query.search) {
    const search = String(request.query.search).toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  const result = tickets.map((ticket) => {
    const requester = database.users.find((user) => user.id === ticket.requesterId);
    const assigned = database.users.find((user) => user.id === ticket.assignedToId);
    const comments = database.comments.filter((comment) => comment.ticketId === ticket.id);

    return {
      ...ticket,
      requester,
      assigned,
      commentsCount: comments.length,
    };
  });

  response.json(result);
});

router.get("/summary", (_request, response) => {
  const database = readDatabase();
  const summary = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  for (const ticket of database.tickets) {
    if (ticket.status === "open") summary.open++;
    if (ticket.status === "in_progress") summary.in_progress++;
    if (ticket.status === "resolved") summary.resolved++;
    if (ticket.status === "closed") summary.closed++;
    if (ticket.priority === "urgent") summary.urgent++;
  }

  response.json(summary);
});

router.get("/:id", (request, response) => {
  const database = readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
    return;
  }

  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: database.users.find((user) => user.id === comment.authorId),
    }));

  response.json({ ...ticket, requester, assigned, comments });
});

router.post("/", (request, response) => {
  const database = readDatabase();
  const body = request.body;

  if (!body.title || !body.description || !body.category || !body.requesterId) {
    response.status(400).json({
      message: "Campos obrigatorios ausentes",
      required: ["title", "description", "category", "requesterId"],
      received: body,
    });
    return;
  }

  const user = database.users.find((item) => item.id === body.requesterId);
  if (!user) {
    response.status(400).json({ message: "Solicitante invalido" });
    return;
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId("ticket"),
    title: body.title,
    description: body.description,
    category: body.category,
    requesterId: body.requesterId,
    assignedToId: body.assignedToId,
    status: "open",
    priority: calculatePriority(body.category, body.description),
    createdAt: now,
    updatedAt: now,
  };

  database.tickets.push(ticket);
  writeDatabase(database);

  response.status(201).json(ticket);
});

router.patch("/:id/status", (request, response) => {
  try {
    const database = readDatabase();

    const ticket = database.tickets.find(
      (item) => item.id === request.params.id
    );

    if (!ticket) {
      return response.status(404).json({
        message: "Ticket nao encontrado",
      });
    }

    const errors = validateStatusUpdate(request.body);

    if (errors.length > 0) {
      // Verifica se o erro é sobre comentário
      if (errors.includes('comment')) {
        return response.status(400).json({
          message: "Comentário obrigatório para fechar chamado",
        });
      }

      if (errors.includes('status')) {
        return response.status(400).json({
          message: "Status inválido",
          allowed: ["open", "in_progress", "resolved", "closed"],
        });
      }

      return response.status(400).json({
        message: "Dados inválidos",
        fields: errors,
      });
    }

    const { status, comment, authorId } = request.body;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    if (comment) {
      database.comments.push({
        id: generateId("comment"),
        ticketId: ticket.id,
        authorId: authorId || ticket.requesterId,
        message: comment,
        createdAt: new Date().toISOString(),
      });
    }

    writeDatabase(database);

    return response.json(ticket);
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/:id/comments", (request, response) => {
  const database = readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);
  const body = request.body;

  if (!ticket) {
    response.status(404).json({ error: "Ticket nao encontrado" });
    return;
  }

  if (!body.message || !body.authorId) {
    response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
    return;
  }

  const comment = {
    id: generateId("comment"),
    ticketId: ticket.id,
    authorId: body.authorId,
    message: body.message,
    createdAt: new Date().toISOString(),
  };

  database.comments.push(comment);
  ticket.updatedAt = new Date().toISOString();
  writeDatabase(database);

  response.status(201).json(comment);
});

export default router;