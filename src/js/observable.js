export class Observable {
  static fromValue(val) {
    return new Observable(function (handler) {
      this._handleNext(handler, val);

      this._subscriptions.push(handler);

      return this._removeSubscription.bind(this, handler);
    });
  }

  static fromArray(arr) {
    return new Observable(function (handler) {
      arr.forEach((e) => this._handleNext(handler, e));

      this._subscriptions.push(handler);

      return this._removeSubscription.bind(this, handler);
    });
  }

  _subscriptions;
  _subscriptionHandler;

  constructor(subscriptionHandler) {
    this._subscriptionHandler = subscriptionHandler;
    this._subscriptions = [];
  }

  subscribe(handler) {
    return this._subscriptionHandler.call(this, handler);
  }

  next(value) {
    this._subscriptions.forEach((h) => this._handleNext(h, value));
  }

  _handleNext({ next, error }, value) {
    try {
      next.call(value, value);
    } catch (err) {
      if (typeof error === 'function') {
        error.call(err, err);
      }
    }
  }

  _removeSubscription(handler) {
    for (let i = 0; i < this._subscriptions.length; i++) {
      if (this._subscriptions[i] === handler) {
        this._subscriptions.splice(i, 1);
      }
    }
  }
}
