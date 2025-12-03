// import { Router } from "express";
// import { searchLDAP } from "../services/ldapService";

// export const ldapRouter = Router();

// ldapRouter.get("/users", async (req, res) => {
//   try {
//     const users = await searchLDAP("(objectClass=person)");
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "LDAP query failed" });
//   }
// });

