import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const database = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  logging: process.env.NODE_ENV === "development" ? console.log : false,

  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export const testConnection = async (): Promise<void> => {
  try {
    await database.authenticate();
    console.log("✅ Conexão com PostgreSQL/Supabase estabelecida!");
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error);
    console.error("💡 Verifique:");
    console.error("   - DB_PASSWORD está correto no .env");
    console.error("   - Firewall/rede permite conexão");
    console.error("   - Credenciais do Supabase estão corretas");
    throw error;
  }
};

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    if (force && process.env.NODE_ENV === "production") {
      console.warn("⚠️  AVISO: Não use force=true em produção!");
      return;
    }

    await database.sync({ force });
    console.log(
      `✅ Database sincronizado${force ? " (FORCE - dados apagados!)" : ""}!`
    );
  } catch (error) {
    console.error("❌ Erro ao sincronizar database:", error);
    throw error;
  }
};

export default database;