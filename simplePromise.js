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
            return value.then(this.resolve.bind(this), this.reject.bind(this));
        }

        this.state = state;
        this.value = value;
        runCallbacksAsync();
    }

    // run all callbacks for this promise asynchronously
    const runCallbacksAsync = () => this.callbackQueue.forEach(({ onResolve, onReject }) => {
        setTimeout(() => {
            if (this.state === PROMISE_STATE.RESOLVED) {
                return onResolve(this.value);
            }
            if (this.state === PROMISE_STATE.REJECTED) {
                return onReject(this.value);
            }
        }, 0);
    });
    
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
            const onResolve = value => setTimeout(() => {
                try {
                    if (!resolveCallback) return resolve(value);
                    resolve(resolveCallback(value));
                } catch(err) {
                    reject(err);
                }
            }, 0);
            const onReject = value => setTimeout(() => {
                try {
                    if (!rejectCallback) return reject(value);
                    resolve(rejectCallback(value));
                } catch(otherError) {
                    reject(otherError);
                }
            }, 0);

            // call handlers directly if previous promise is already fulfilled
            if (that.state === PROMISE_STATE.RESOLVED) return onResolve(that.value);
            if (that.state === PROMISE_STATE.REJECTED) return onReject(that.value);
            that.callbackQueue.push({ onResolve, onReject });
        });
    }

    this.catch = rejectCallback => this.then(noop, rejectCallback);
};

function noop(value) { return value; }