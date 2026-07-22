import { Router } from "express";

import healthRoutes from "./routes/health";
import usersRoutes from "./routes/users";
import ticketsRoutes from "./routes/tickets";

const router = Router();

router.use("/health", healthRoutes);

router.use("/users", usersRoutes);

router.use("/tickets", ticketsRoutes);

export default router;