function TodoApp() {
  this.todoListData = [
    // { taskId: '1', userId: 1, name: 'Todo 1', isDone: true },
    // { taskId: '2', userId: 2, name: 'Todo 2', isDone: false },
    // { taskId: '3', userId: 1, name: 'Làm bài tập về nhà nhứ 3 trong tuần', isDone: false },
  ];
  this.editingIndex = -1;
  this.todoNameInput = document.getElementById('task-name');
  this.addTodoButton = document.getElementById('add-task-button');
  this.cancelEditButton = document.getElementById('cancel-edit-button');
  this.filterInput = document.getElementById('filter-input');
  this.todoList = document.getElementById('todo-list');

  this.addTodoButton.addEventListener('click', this.addOrEditTodo.bind(this));
  this.cancelEditButton.addEventListener('click', this.cancelEdit.bind(this));
  this.filterInput.addEventListener('change', this.renderList.bind(this));
  this.checkLogin();
  this.renderList();
}

TodoApp.prototype.checkLogin = function () {
  // debugger
  const storedUser = sessionStorage.getItem('loggedInUser');
  if (storedUser) {
    if (storedUser.useId === null) {
      localStorage.removeItem('loggedInUser');
      window.location.href = '../../index.html';
      console.log('session')
    }
  }
  else {
    const storedUserLocal = localStorage.getItem('loggedInUser');
    if (storedUserLocal) {
      if (storedUserLocal.useId === null) {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../../index.html';
        console.log('local')
      }
    }
  }
};

TodoApp.prototype.logout = function () {
  sessionStorage.removeItem('loggedInUser');
  localStorage.removeItem('loggedInUser');
  this.renderList();
};
TodoApp.prototype.getUser = function () {
  const storedUser = sessionStorage.getItem('loggedInUser');
  if (storedUser) {
    if (storedUser.useId !== null) {
      return storedUser;
    }
  }
  else {
    const storedUserLocal = localStorage.getItem('loggedInUser');
    if (storedUserLocal) {
      if (storedUserLocal.useId !== null) {
        return storedUserLocal;
      }
    }
  }
}
TodoApp.prototype.addOrEditTodo = function () {
  this.checkLogin()
  function generateUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  const storedUser = this.getUser();
  const user = JSON.parse(storedUser);
  const taskName = this.todoNameInput.value.trim();
  const taskID = generateUID();
  console.log(taskID)

  if (taskName) {
    if (this.editingIndex === -1) {
      this.todoListData.push({
        taskId: taskID,
        userId: user.userId,
        name: taskName,
        isDone: false
      });

    } else {
      this.todoListData[this.editingIndex].name = taskName;
      this.editingIndex = -1;
      this.addTodoButton.textContent = 'Add';
      this.cancelEditButton.style.display = 'none';
    }
    this.todoNameInput.value = '';
    localStorage.setItem('todoList', JSON.stringify(this.todoListData));
    this.renderList();
  }
};

TodoApp.prototype.renderList = function () {
  const url = 'http://localhost:8080/api/tasks';
  const method = 'GET';
  const storedUser = this.getUser();
  const xhr = new XMLHttpRequest();
  xhr.open( method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', '123456789');

  // xhr.withCredentials = true;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log('User data', response);
      } else {
        console.error('Error:', xhr.statusText);
      }
    }
  };
  xhr.send();
  // debugger
  const todoList = localStorage.getItem('todoList')

  if (storedUser) {
    // Lấy dữ liệu từ localStorage
    if (todoList) {
      this.todoListData = JSON.parse(todoList)
    }
    const user = JSON.parse(storedUser);
    const userID = user.userId
    const filterValue = this.filterInput.value;

    // lọc todo theo người dùng
    const todoUserList = this.todoListData.filter(todo => todo.userId === userID);

    this.todoList.innerHTML = '';
    todoUserList.forEach((todo, index) => {
      if (
        filterValue === 'all' ||
        (filterValue === 'done' && todo.isDone) ||
        (filterValue === 'undone' && !todo.isDone)
      ) {
        const li = document.createElement('li');
        li.innerHTML = `
          <input type="checkbox" onchange="app.checkTodo('${todo.taskId}')" ${todo.isDone ? 'checked' : ''
          }>
          <span>${todo.name}</span>
          <div class="area-button">
          <button class="edit-button" onclick="app.editTodo('${todo.taskId}')">Edit</button>
          <button class="delete-button" onclick="app.deleteTodo('${todo.taskId}')">Delete</button>
          </div>
          `;
        this.todoList.appendChild(li);
      }
    });
  } else {
    // Chuyển màn hình tới login
    window.location.href = '../../index.html';
  }
};

TodoApp.prototype.editTodo = function (taskID) {
  this.checkLogin()
  const todoList = localStorage.getItem('todoList')
  // Lấy dữ liệu từ localStorage
  if (todoList) {
    this.todoListData = JSON.parse(todoList)
  }
  let index = this.todoListData.findIndex(todo => todo.taskId === taskID);
  if (index !== -1) {
    // Cập nhật phần tử tại index tìm được
    this.todoNameInput.value = this.todoListData[index].name;
    this.editingIndex = index;
    this.addTodoButton.textContent = 'Save';
    this.cancelEditButton.style.display = 'inline';
  }
  localStorage.setItem('todoList', JSON.stringify(this.todoListData));
  this.renderList();
};

TodoApp.prototype.cancelEdit = function () {
  this.todoNameInput.value = '';
  this.editingIndex = -1;
  this.addTodoButton.textContent = 'Add';
  this.cancelEditButton.style.display = 'none';
};

TodoApp.prototype.deleteTodo = function (taskID) {
  this.checkLogin()
  const todoList = localStorage.getItem('todoList')
  // Lấy dữ liệu từ localStorage
  if (todoList) {
    this.todoListData = JSON.parse(todoList)
  }
  this.todoListData = this.todoListData.filter(item => item.taskId !== taskID);
  localStorage.setItem('todoList', JSON.stringify(this.todoListData));
  this.renderList();
};

TodoApp.prototype.checkTodo = function (taskID) {
  this.checkLogin()
  const todoList = localStorage.getItem('todoList')
  // Lấy dữ liệu từ localStorage
  if (todoList) {
    this.todoListData = JSON.parse(todoList)
  }
  let index = this.todoListData.findIndex(todo => todo.taskId === taskID);
  if (index !== -1) {
    // Cập nhật phần tử tại index tìm được
    this.todoListData[index].isDone = !this.todoListData[index].isDone;
  }
  localStorage.setItem('todoList', JSON.stringify(this.todoListData));
  this.renderList();
};

const app = new TodoApp();