import SimplePromise from "../simplePromise.js"
import chai from 'chai'
const { expect } = chai

describe('SimplePromise', () => {
    const errorMessage = 'some error';
    it('Constructor function', () => {
        expect(typeof SimplePromise).to.equal('function')
    })
    it('"new" keyword required', () => {
        let error = null;
        try {
            SimplePromise(res => res()); // missing "new" keyword
        } catch (err) {
            error = err;
        }
        expect(error).to.not.be.null;
        expect(typeof new SimplePromise(res => res())).to.equal('object');
    });
    it('resolver function required', () => {
        let error = null;
        try {
            new SimplePromise(); // missing resolver function
        } catch (err) {
            error = err;
        }
        expect(error).to.not.be.null;
        expect(typeof new SimplePromise(res => res())).to.equal('object');
    });
    it('should run asynchronously', done => {
        let value = 0;
        new SimplePromise(res => res())
            .then(() => { 
                expect(value).to.equal(1);
                done();
            });
        value++; // should execute before 'then' block
    });
    it('Multiple "then" run in sequence', done => {
        let value = 0;
        new SimplePromise(res => res())
            .then(() => {
                expect(value++).to.equal(0);
            })
            .then(() => {
                expect(value++).to.equal(1);
            })
            .then(() => {
                expect(value++).to.equal(2);
            })
            .then(() => {
                expect(value++).to.equal(3);
            })
            .then(() => done());
    });
    it('errors are caught with "catch"', done => {
        new SimplePromise(res => { throw Error(errorMessage); })
            .then(() => {
                done('This should never run');
            })
            .catch(error => {
                expect(error.message).to.equal(errorMessage);
                done();
            });
    });
    it('then & catch', done => {
        const persistentErrorMessage = errorMessage + '... again!';
        new SimplePromise(res => res())
            .then(() => { throw new Error(errorMessage) })
            .catch(error => error.message)
            .then(message => expect(message).to.equal(errorMessage))
            .then(() => { throw new Error(persistentErrorMessage)})
            .catch(error => expect(error.message).to.equal(persistentErrorMessage))
            .then(() => done());
    });
});