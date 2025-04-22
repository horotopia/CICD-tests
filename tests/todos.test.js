const request = require('supertest');
const { app, todos } = require('../index');

// Sauvegarde de l'état initial des todos pour restauration après les tests
let initialTodos;

beforeEach(() => {
  // Copie profonde des todos pour éviter les références
  initialTodos = JSON.parse(JSON.stringify(todos));
});

afterEach(() => {
  // Restauration des todos à leur état initial après chaque test
  while (todos.length > 0) {
    todos.pop();
  }
  initialTodos.forEach(todo => todos.push(todo));
});

describe('GET /api/todos', () => {
  test('should return all todos', async () => {
    const response = await request(app).get('/api/todos');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].task).toBe('Apprendre Express.js');
  });
});

describe('GET /api/todos/:id', () => {
  test('should return a specific todo', async () => {
    const response = await request(app).get('/api/todos/1');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.task).toBe('Apprendre Express.js');
  });

  test('should return 404 if todo not found', async () => {
    const response = await request(app).get('/api/todos/999');
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Todo non trouvée');
  });
});

describe('POST /api/todos', () => {
  test('should create a new todo', async () => {
    const newTodo = { task: 'Nouvelle tâche' };
    const response = await request(app)
      .post('/api/todos')
      .send(newTodo);
    
    expect(response.status).toBe(201);
    expect(response.body.task).toBe('Nouvelle tâche');
    expect(response.body.completed).toBe(false);
    expect(response.body.id).toBe(4); // Nouvel ID après les 3 todos existants
  });

  test('should return 400 if task is missing', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Le champ task est obligatoire');
  });
});

describe('PUT /api/todos/:id', () => {
  test('should update an existing todo', async () => {
    const updatedTodo = { task: 'Tâche mise à jour', completed: true };
    const response = await request(app)
      .put('/api/todos/2')
      .send(updatedTodo);
    
    expect(response.status).toBe(200);
    expect(response.body.task).toBe('Tâche mise à jour');
    expect(response.body.completed).toBe(true);
    expect(response.body.id).toBe(2);
  });

  test('should return 404 if todo to update is not found', async () => {
    const response = await request(app)
      .put('/api/todos/999')
      .send({ task: 'Tâche mise à jour' });
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Todo non trouvée');
  });

  test('should partially update a todo', async () => {
    const response = await request(app)
      .put('/api/todos/3')
      .send({ completed: true });
    
    expect(response.status).toBe(200);
    expect(response.body.task).toBe('Tester avec Postman'); // Inchangé
    expect(response.body.completed).toBe(true); // Mis à jour
  });
});

describe('DELETE /api/todos/:id', () => {
  test('should delete an existing todo', async () => {
    const response = await request(app).delete('/api/todos/3');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(3);
    
    // Vérifier que la todo a bien été supprimée
    const checkResponse = await request(app).get('/api/todos');
    expect(checkResponse.body).toHaveLength(2);
    expect(checkResponse.body.find(todo => todo.id === 3)).toBeUndefined();
  });

  test('should return 404 if todo to delete is not found', async () => {
    const response = await request(app).delete('/api/todos/999');
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Todo non trouvée');
  });
});