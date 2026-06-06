const STORAGE_KEY = "just-do-it.tasks";

const input = document.getElementById("task-input");
const prioritySelect = document.getElementById("task-priority");
const addButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const timestamp = document.getElementById("timestamp");
const taskTemplate = document.getElementById("task-template");

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function syncPrioritySelectColor() {
  prioritySelect.dataset.priority = prioritySelect.value;
}

const state = {
  tasks: loadTasks(),
};

function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleString([], {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  for (const task of state.tasks) {
    const taskNode = taskTemplate.content.firstElementChild.cloneNode(true);
    taskNode.dataset.id = task.id;
    taskNode.classList.toggle("is-completed", Boolean(task.completed));
    const checkbox = taskNode.querySelector(".task-check");
    checkbox.checked = Boolean(task.completed);
    checkbox.addEventListener("change", () => {
      state.tasks = state.tasks.map((item) =>
        item.id === task.id ? { ...item, completed: checkbox.checked } : item,
      );
      saveTasks();
      renderTasks();
    });
    taskNode.querySelector(".task-text").textContent = task.text;
    const priorityNode = taskNode.querySelector(".task-priority");
    priorityNode.textContent = priorityLabels[task.priority] || priorityLabels.medium;
    priorityNode.dataset.priority = task.priority || "medium";
    taskNode.querySelector(".task-remove").addEventListener("click", () => {
      state.tasks = state.tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });
    taskList.append(taskNode);
  }

  taskCount.textContent = `${state.tasks.length} task${state.tasks.length === 1 ? "" : "s"}`;
  emptyState.hidden = state.tasks.length > 0;
}

function addTask() {
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  state.tasks = [
    {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority: prioritySelect.value,
    },
    ...state.tasks,
  ];

  input.value = "";
  prioritySelect.value = "medium";
  syncPrioritySelectColor();
  saveTasks();
  renderTasks();
  input.focus();
}

addButton.addEventListener("click", addTask);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

prioritySelect.addEventListener("change", syncPrioritySelectColor);

syncPrioritySelectColor();
renderTasks();
timestamp.textContent = formatTimestamp();
window.setInterval(() => {
  timestamp.textContent = formatTimestamp();
}, 1000);
input.focus();
