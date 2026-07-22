import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { Database } from "../types";

const router = Router();
const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, "utf-8");
  return JSON.parse(content) as Database;
}

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