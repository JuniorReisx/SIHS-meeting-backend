import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import  { authRouter }  from "./routes/auth.routes";
import  { meetingRouter } from "./routes/meeting.routes";
import  { userRouter }  from "./routes/user.routes";
import  { adminRouter }  from "./routes/admin.routes";

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (req: Request, res: Response) => {
  res.send("Servidor funcionando!");
});

server.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    message: "Servidor rodando",
    ldap: process.env.LDAP_URL ? "configurado" : "não configurado",
    supabase: process.env.SUPABASE_URL ? "configurado" : "não configurado"
  });
});

server.use("/auth", authRouter);
server.use("/meeting", meetingRouter);
server.use("/admin", adminRouter);
server.use("/user", userRouter);

server.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    path: req.path
  });
});

server.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("Erro não tratado:", err);
  
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔐 LDAP URL: ${process.env.LDAP_URL || "não configurado"}`);
      console.log(`📁 Base DN: ${process.env.LDAP_BASE_DN || "não configurado"}`);
      console.log(`💾 Supabase: ${process.env.SUPABASE_URL ? "configurado" : "não configurado"}`);
      console.log("\n📋 Rotas disponíveis:");
      console.log("   GET    /");
      console.log("   GET    /health");
      console.log("   POST   /api/auth/login");
      console.log("   POST   /api/auth/verify");
      console.log("   POST   /api/auth/logout");
      console.log("   POST   /api/meetings");
      console.log("   GET    /api/meetings");
      console.log("   GET    /api/meetings/:id");
      console.log("   PUT    /api/meetings/:id");
      console.log("   DELETE /api/meetings/:id");
      console.log("   GET    /api/meetings/date/:date");
      console.log("   GET    /api/meetings/participant/:name");
    });

  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();