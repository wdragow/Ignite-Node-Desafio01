const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(400).json({ error: 'User not found!' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameExist = users.some(user => user.username === username)

  if(usernameExist) {
    return response.status(400).json({ error: 'Username already exists!'})
  }

  const userToAdd = {
    id: uuidv4(),
    name: name, 
    username: username, 
    todos: []
  }
  
  users.push(userToAdd)

  return response.status(201).json(userToAdd)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todoObject = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todoObject)

  return response.status(201).json(todoObject)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  
  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.findIndex(todo => todo.id === id)

  if(todo === -1) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  user.todos.splice(todo, 1)

  return response.status(204).json()
});

module.exports = app;