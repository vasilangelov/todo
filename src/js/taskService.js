import { Observable } from './observable.js';

export class TaskService {
  _tasks;
  _lastId;

  tasks$;
  pendingCount$;

  constructor() {
    this._tasks = JSON.parse(localStorage.getItem('tasks')) ?? [];

    this._lastId = this._tasks[this._tasks.length - 1]?.id ?? 0;

    this.tasks$ = Observable.fromArray(this._tasks);
    this.pendingCount$ = Observable.fromValue(
      this._tasks.filter((t) => !t.completed).length
    );
  }

  add(task) {
    Object.assign(task, { id: ++this._lastId, completed: false });

    this._tasks.push(task);
    this._saveToLocalStorage();

    this.tasks$.next(task);
    this.pendingCount$.next(this._tasks.filter((t) => !t.completed).length);

    return task;
  }

  changeCompletedState(id) {
    const task = this._tasks.find((t) => t.id === id);

    task.completed = !task.completed;
    this._saveToLocalStorage();

    this.pendingCount$.next(this._tasks.filter((t) => !t.completed).length);
  }

  delete(taskId) {
    let index = -1;

    for (let i = 0; i < this._tasks.length; i++) {
      if (this._tasks[i].id === taskId) {
        index = i;
        break;
      }
    }

    if (index != -1) {
      this._tasks.splice(index, 1);
      this._saveToLocalStorage();
      this.pendingCount$.next(this._tasks.filter((t) => !t.completed).length);
    }
  }

  deleteCompleted() {
    this._tasks = this._tasks.filter((t) => !t.completed);
    this._saveToLocalStorage();

    const oldSubscriptions = this.tasks$._subscriptions;
    this.tasks$ = Observable.fromArray(this._tasks);
    this.tasks$._subscriptions = oldSubscriptions;
  }

  _saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this._tasks));
  }
}
