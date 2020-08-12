const PROMISE_STATE = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
}

export default function SimplePromise (task) {
    if (!task || typeof task !== 'function') throw new Error('SimplePromise must receive a task');

    this.state = PROMISE_STATE.PENDING;
    this.value = null;
    this.callbackQueue = [];

    const setState = state => value => {
        if (this.state !== PROMISE_STATE.PENDING) {
            // CANNOT ALTER STATE AFTER FULFILLMENT
            return;
        }

        // if thennable, call then() function in order to chain other promises
        if (value && value.then && typeof value.then === 'function') {
            value.then(this.resolve.bind(this), this.reject.bind(this));
            return;
        }

        this.state = state;
        this.value = value;

        runCallbacksAsync();
    }

    const runCallbacksAsync = () => this.callbackQueue.forEach(handlers => {
        // run all callbacks for this promise asynchronously
        setTimeout(() => {
            runCallback.call(this, handlers);
        }, 0);
    });

    const runCallback = ({ onResolve, onReject }) => {
        if (this.state === PROMISE_STATE.RESOLVED) return onResolve(this.value);
        if (this.state === PROMISE_STATE.REJECTED) return onReject(this.value);
    }
    
    this.resolve = setState(PROMISE_STATE.RESOLVED);
    this.reject = setState(PROMISE_STATE.REJECTED);

    try {
        // run task synchronously
        task(this.resolve.bind(this), this.reject.bind(this));
    } catch(err) {
        this.reject(err);
    }
    
    /**
     * Returns a new promise that will handle provided callbacks
     */
    this.then = function(resolveCallback, rejectCallback) {
        const that = this;
        return new SimplePromise((resolve, reject) => {
            const handlers = {
                onResolve: value => setTimeout(() => {
                    try {
                        if (!resolveCallback) return resolve(value);
                        resolve(resolveCallback(value));
                    } catch(err) {
                        reject(err);
                    }
                }, 0),
                onReject: value => setTimeout(() => {
                    try {
                        // reject if there is no error handler, reject
                        if (!rejectCallback) return reject(value);
                        resolve(rejectCallback(value));
                    } catch(otherError) {
                        reject(otherError);
                    }
                }, 0)
            };

            if (that.state === PROMISE_STATE.PENDING) return that.callbackQueue.push(handlers);

            // call handlers directly if previous promise is already fulfilled
            runCallback.call(that, handlers);
        });
    }

    this.catch = rejectCallback => this.then(null, rejectCallback);
};