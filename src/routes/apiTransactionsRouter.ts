import { Router } from "express";
import apiTransactions from "../controllers/apiTransactionsControllers/apiTransactions";

const router = Router();

router.get("/all", apiTransactions);

export {router as apiTransactionsRouter};