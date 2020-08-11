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

        runCallbacksAsync();
    };

    this.reject = err => {
        this.state = PROMISE_STATE.REJECTED;
        this.value = err;
        console.log(err);
        runCallbacksAsync();
    }

    const runCallbacksAsync = () => setTimeout(() => {
        this.callbackQueue = this.callbackQueue.reduce((_, cb) => cb(this.value), []);
    }, 0);

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