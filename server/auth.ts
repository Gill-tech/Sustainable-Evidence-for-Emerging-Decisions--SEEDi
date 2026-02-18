import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Express, Request, Response } from "express";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initAuthDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      google_id VARCHAR(255),
      role VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      token VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    );
  `);
}

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expiresAt]
  );
  return token;
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at",
        [name, email.toLowerCase(), passwordHash]
      );

      const user = result.rows[0];
      const token = await createSession(user.id);

      res.status(201).json({
        message: "Account created successfully",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await pool.query(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result.rows[0];

      if (!user.password_hash) {
        return res.status(401).json({ message: "This account uses Google sign-in. Please log in with Google." });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = await createSession(user.id);

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const token = authHeader.slice(7);
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.created_at 
         FROM sessions s JOIN users u ON s.user_id = u.id 
         WHERE s.token = $1 AND s.expires_at > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Session expired or invalid" });
      }

      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error("Auth check error:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
      }
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/auth/google", (_req: Request, res: Response) => {
    res.status(501).json({ 
      message: "Google OAuth requires configuration. Please sign up with email for now." 
    });
  });
}
