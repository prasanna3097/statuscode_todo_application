const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    case hasCategoryAndStatus(requestQuery):
      getTodosQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND status = '${status}'`;
      break;
    case hasCategoryProperty(requestQuery):
      getTodosQuery = `
        SELECT *
        From todo
        WHERE todo like '%${search_q}%'
        AND category = '${category}'`;
      break;
    case hasCategoryAndPriority(requestQuery):
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `
    SELECT * 
    FROM todo
    WHERE id = ${todoId};`;
  const getData = await db.get(getTodoIdQuery);
  response.send(getData);
});

app.get("/agenda/", async (request, response) => {
  const date = format(new Date(2021, 1, 21), "yyyy-MM-dd");
  const getDateQuery = `SELECT * FROM todo WHERE due_date = ${date}`;
  const dateArray = await db.get(getDateQuery);
  response.send(dateArray);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
    INSERT INTO 
    todo(id, todo, priority, status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  const createdQuery = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updatedColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      return (requestBody = "Status");
      break;
    case requestBody.priority !== undefined:
      return (requestBody = "Priority");
      break;
    case requestBody.todo !== undefined:
      return (requestBody = "Todo");
      break;
    case requestBody.category !== undefined:
      return (requestBody = "Category");
      break;
    case requestBody.dueDate !== undefined:
      return (requestBody = "Due Date");
      break;
  }
  const previousUpdatedTodo = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;

  const previousData = await db.get(previousUpdatedTodo);

  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  const updatedQuery = `
    UPDATE todo
    SET 
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}'
    WHERE id = ${todoId};`;
  await db.run(updatedQuery);
  response.send(`${updatedColumn} updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
    todo 
    WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
