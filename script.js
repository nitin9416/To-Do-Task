const storageKey = "nitin-todo-tasks";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");
const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.querySelector("#clear-completed");

let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey));

    if (!Array.isArray(savedTasks)) {
      return [];
    }

    return savedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "done") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item completed" : "task-item";
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      task.completed ? `Mark ${task.text} as active` : `Mark ${task.text} as done`
    );

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });

  const remainingTasks = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${remainingTasks} ${remainingTasks === 1 ? "task" : "tasks"} left`;

  emptyMessage.classList.toggle("visible", visibleTasks.length === 0);
  clearCompletedButton.disabled = !tasks.some(task => task.completed);

  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    return;
  }

  tasks.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

taskList.addEventListener("change", event => {
  if (!event.target.matches(".task-checkbox")) {
    return;
  }

  const item = event.target.closest(".task-item");
  const task = tasks.find(entry => entry.id === item.dataset.id);

  if (task) {
    task.completed = event.target.checked;
    saveTasks();
    renderTasks();
  }
});

taskList.addEventListener("click", event => {
  const deleteButton = event.target.closest('[data-action="delete"]');

  if (!deleteButton) {
    return;
  }

  const item = deleteButton.closest(".task-item");
  tasks = tasks.filter(task => task.id !== item.dataset.id);
  saveTasks();
  renderTasks();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();