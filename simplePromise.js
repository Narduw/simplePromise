const PROMISE_STATE = {
    PENDING: 0,
    RESOLVED: 1,
    REJECTED: 2
}

export default function SimplePromise (task) {
    this.state = PROMISE_STATE.PENDING;
    this.value = null;
    this.callbackQueue = [];

    const fulfill = state => value => {
        if (this.state !== PROMISE_STATE.PENDING) {
            // CANNOT ALTER STATE AFTER FULFILLMENT
            return;
        }

        // if thennable, call then() function in order to chain other promises
        if (value && value.then && typeof value.then === 'function') {
            return value.then(this.resolve);
        }

        this.state = state;
        this.value = value;
        runCallbacksAsync();
    }

    const runCallbacksAsync = () => setTimeout(() => {
        // run all callbacks for this promise asynchronously
        this.callbackQueue = this.callbackQueue.reduce((_, cb) => cb(this.value), []);
    }, 0);

    this.resolve = fulfill(PROMISE_STATE.RESOLVED).bind(this);
    this.reject = fulfill(PROMISE_STATE.REJECTED).bind(this);

    try {
        // run task synchronously
        task(this.resolve, this.reject);
    } catch(err) {
        this.reject(err);
    }

    /**
     * Returns a new promise that will handle provided callbacks
     */
    this.then = function(callback) {
        return new SimplePromise((resolve, reject) => {
            this.callbackQueue.push(function(value) {
                // fulfill the new promise with the result given by the callback
                try {
                    resolve(callback(value));
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
};