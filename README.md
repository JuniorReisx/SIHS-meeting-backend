
---

# 🚀 Backend System

A backend service built with **Node.js**, **TypeScript**, **Express**, **Supabase**, and **LDAP authentication**.
This project provides APIs for authentication, data management, and secure integrations with external services.

---

## 📌 Features

* ⚡ **Express** server with modular structure
* 🔐 **LDAP Active Directory authentication**
* 🗄️ Database integration using **Supabase**
* 🌐 **CORS** configured
* 🔧 Environment variables with **dotenv**
* 🛠️ Hot reload using **nodemon / ts-node**
* 📦 TypeScript build with `tsc`

---

## 🛠️ Technologies

* **Node.js**
* **TypeScript**
* **Express 5**
* **Supabase (JS SDK v2)**
* **LDAPJS**
* **CORS**
* **dotenv**

---

## 📁 Project Structure (suggested)

```
backendsystem/
├── src/
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   └── config/
├── dist/                # build output
├── .env
├── package.json
└── tsconfig.json
```

---

## ⚙️ Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Runs the server with ts-node (ESM loader) |
| `npm run dev:watch` | Starts nodemon for hot reload             |
| `npm run build`     | Compiles TypeScript into `dist/`          |
| `npm start`         | Starts production build (dist/server.js)  |

---

## 🔑 Environment Variables

Create a `.env` file:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=

LDAP_URL=ldap://your-ad-server
LDAP_BASE_DN=
LDAP_USER_DN=
LDAP_PASSWORD=
PORT=3000
```

---

## ▶️ Running the Project

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start development server

```bash
npm run dev
```

### 3️⃣ Build for production

```bash
npm run build
```

### 4️⃣ Start production server

```bash
npm start
```

---

## 🔐 LDAP Authentication Example (optional)

```ts
import ldap from "ldapjs";

const client = ldap.createClient({
  url: process.env.LDAP_URL,
});

client.bind(username, password, (err) => {
  if (err) console.log("Invalid credentials");
  else console.log("Authenticated successfully");
});
```

---

## 🗄️ Supabase Example

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Junior Reis**
GitHub: [https://github.com/JuniorReisx](https://github.com/JuniorReisx)
