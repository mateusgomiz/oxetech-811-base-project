import { Router } from "express";
import { readDatabase } from "../utils/database";

const router = Router();

router.get("/", (_request, response) => {
  try {
    const database = readDatabase();
    response.json(database.users);
  } catch (error: any) {
    response.status(500).json({ 
      error: "Erro ao buscar usuários",
      message: error.message 
    });
  }
});

router.get("/:id", (request, response) => {
  try {
    const database = readDatabase();
    const user = database.users.find((u) => u.id === request.params.id);
    
    if (!user) {
      return response.status(404).json({ 
        error: "Usuário não encontrado",
        id: request.params.id 
      });
    }
    
    response.json(user);
  } catch (error: any) {
    response.status(500).json({ 
      error: "Erro ao buscar usuário",
      message: error.message 
    });
  }
});

export default router;