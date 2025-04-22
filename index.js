const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de données temporaire
let todos = [
  { id: 1, task: 'Apprendre Express.js', completed: false },
  { id: 2, task: 'Créer une API todolist', completed: false },
  { id: 3, task: 'Tester avec Postman', completed: false }
];

// Routes
// GET - Récupérer toutes les todos
app.get('/api/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET - Récupérer une todo par son ID
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(todo => todo.id === id);
  
  if (!todo) {
    return res.status(404).json({ message: 'Todo non trouvée' });
  }
  
  res.status(200).json(todo);
});

// POST - Créer une nouvelle todo
app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  
  if (!task) {
    return res.status(400).json({ message: 'Le champ task est obligatoire' });
  }
  
  const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  const newTodo = { id: newId, task, completed: false };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT - Mettre à jour une todo existante
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { task, completed } = req.body;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo non trouvée' });
  }
  
  todos[todoIndex] = { 
    ...todos[todoIndex], 
    task: task !== undefined ? task : todos[todoIndex].task,
    completed: completed !== undefined ? completed : todos[todoIndex].completed
  };
  
  res.status(200).json(todos[todoIndex]);
});

// DELETE - Supprimer une todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo non trouvée' });
  }
  
  const deletedTodo = todos[todoIndex];
  todos = todos.filter(todo => todo.id !== id);
  
  res.status(200).json(deletedTodo);
});

// Démarrage du serveur uniquement si ce fichier est exécuté directement (pas importé)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`>>>>>>> http://localhost:${PORT}`);
  });
}

// Exportation pour les tests
module.exports = { app, todos };