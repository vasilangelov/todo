import { TaskService } from './taskService.js';
import { el } from './utilites.js';

document.addEventListener('DOMContentLoaded', main);

const taskService = new TaskService();
let displayAll = true;

function main() {
  setupColorScheme();

  const taskContainer = document.getElementById('taskContainer');

  const handler = {
    next: (task) => {
      taskContainer.appendChild(createTask(task));
    },
    error: (err) => {
      console.error(err);
    },
  };

  const unsubscribe = taskService.tasks$.subscribe(handler);

  setupTaskCount();
  setupTaskContainer(taskContainer);
  setupTaskFilters(taskContainer, handler, unsubscribe);
  setupClearCompleted(taskContainer, handler, unsubscribe);
  setupTaskInput(taskContainer);
}

function setupColorScheme() {
  const colorSchemeBtn = document.getElementById('colorSchemeBtn');

  document.body.dataset.scheme = matchMedia('(prefers-color-scheme: light)')
    .matches
    ? 'light'
    : 'dark';

  colorSchemeBtn.addEventListener('click', changeColorScheme);
}

function changeColorScheme() {
  return (document.body.dataset.scheme =
    document.body.dataset.scheme === 'light' ? 'dark' : 'light');
}

function setupTaskCount() {
  const taskCount = document.getElementById('taskCount');

  taskService.pendingCount$.subscribe({
    next: (value) => {
      switch (value) {
        case 1:
          taskCount.textContent = `${value} task left`;
          break;
        default:
          taskCount.textContent = `${value} tasks left`;
          break;
      }
    },
  });
}

function setupTaskContainer(taskContainer) {
  const actionMap = {
    deleteTask: function (btn) {
      const task = btn.parentElement;

      taskService.delete(Number(task.dataset.id));

      task.parentElement.removeChild(task);
    },
    completeTask: function (btn) {
      taskService.changeCompletedState(Number(btn.parentElement.dataset.id));

      if (!displayAll) {
        taskContainer.removeChild(btn.parentElement);
      }
    },
  };

  taskContainer.addEventListener('click', function ({ target }) {
    const action = target.dataset.action;

    if (typeof actionMap[action] === 'function') {
      actionMap[action].call(undefined, target);
    }
  });
}

function setupTaskFilters(taskContainer, handler, unsubscribe) {
  const taskFilters = document.getElementById('taskFilters');

  const eventMap = {
    all: () => {
      displayAll = true;

      handler.next = (task) => {
        taskContainer.appendChild(createTask(task));
      };
    },
    active: () => {
      displayAll = false;

      handler.next = (task) => {
        if (!task.completed) {
          taskContainer.appendChild(createTask(task));
        }
      };
    },
    completed: () => {
      displayAll = false;

      handler.next = (task) => {
        if (task.completed) {
          taskContainer.appendChild(createTask(task));
        }
      };
    },
  };

  taskFilters.addEventListener('click', function (e) {
    const filter = e.target.dataset.display;

    if (typeof eventMap[filter] === 'function') {
      taskFilters.querySelector('.active').classList.remove('active');
      e.target.classList.add('active');

      taskContainer.innerHTML = '';
      unsubscribe();

      eventMap[filter].call();

      taskService.tasks$.subscribe(handler);
    }
  });
}

function setupClearCompleted(taskContainer, handler, unsubscribe) {
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  clearCompletedBtn.addEventListener('click', function () {
    taskService.deleteCompleted();

    taskContainer
      .querySelectorAll('.checkbox:checked')
      .forEach(({ parentElement }) => {
        taskContainer.removeChild(parentElement);
      });

    // unsubscribe();

    // taskContainer.innerHTML = '';
    // taskService.tasks$.subscribe(handler);
  });
}

function setupTaskInput() {
  const taskInput = document.getElementById('taskInput');

  taskInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
      taskService.add({ description: e.target.value });

      e.target.value = '';
    }
  });
}

const createTask = (function () {
  const taskTemplate = el('article', undefined, { class: 'row task' });
  taskTemplate.appendChild(
    el(
      'input',
      { type: 'checkbox' },
      { class: 'checkbox', 'data-action': 'completeTask' }
    )
  );
  taskTemplate.appendChild(el('p', undefined, { class: 'task-description' }));
  taskTemplate.appendChild(
    el(
      'a',
      { href: 'javascript:;' },
      { class: 'delete-task', 'data-action': 'deleteTask' }
    )
  );

  return function (taskObj) {
    const task = taskTemplate.cloneNode(true);

    task.dataset.id = taskObj.id;
    if (taskObj.completed) {
      task.querySelector('.checkbox').checked = true;
    }
    task.querySelector('.task-description').textContent = taskObj.description;

    return task;
  };
})();
