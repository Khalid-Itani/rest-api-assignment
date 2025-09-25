// src/index.js
const express = require('express');
const { randomUCID } = require('crypto');

const app = express();
app.use(express.json());

// In-memory store
const users = [];

const genId = () =>
  typeof randomUCID === 'function'
    ? randomUCID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

const findUserIndex = (id) => users.findIndex((u) => u.id === id);

// 1) Create a User: POST /users
app.post('/users', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const user = { id: genId(), name, email };
  users.push(user);
  return res.status(201).json(user);
});

// 2) Retrieve a User: GET /users/:id
app.get('/users/:id', (req, res) => {
  const idx = findUserIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json(users[idx]);
});

// 3) Update a User: PUT /users/:id
app.put('/users/:id', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const idx = findUserIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users[idx] = { id: users[idx].id, name, email };
  return res.status(200).json(users[idx]);
});

// 4) Delete a User: DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  const idx = findUserIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(idx, 1);
  return res.status(204).send();
});

// Export app for tests; also allow running locally
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}
module.exports = app;
