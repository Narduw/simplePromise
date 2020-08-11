const PROMISE_STATE = {
    PENDING: 0,
    RESOLVED: 1,
    REJECTED: 2
}

export default function SimplePromise (task) {
    this.state = PROMISE_STATE.PENDING;
    this.value = null;
    this.callbackQueue = [];

    this.resolve = value => {
        this.state = PROMISE_STATE.RESOLVED;
        this.value = value;

        // run callbacks asynchronously
        setTimeout(runCallbacks, 0);
    };

    this.reject = err => {
        console.log(err);
        // run callbacks asynchronously
        setTimeout(runCallbacks, 0);
    }

    const runCallbacks = () => {
        this.callbackQueue = this.callbackQueue.reduce((_, cb) => cb(this.value), []);
    }

    try {
        // Run task synchronously
        task(this.resolve.bind(this), this.reject.bind(this));
    } catch(err) {
        this.reject(err);
    }

    /**
     * Returns a promise that will resolve with the callback function
     */
    this.then = function(callback) {
        return new SimplePromise((resolve, reject) => {
            this.callbackQueue.push(function(value) {
                try {
                    resolve(callback(value));
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
};