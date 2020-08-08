import SimplePromise from "../simplePromise.js"
import chai from 'chai'
const { expect } = chai

describe('basic properties', () => {
    it('Constructor function', () => {
        expect(typeof SimplePromise).to.equal('function')
    })
    it('Instantiation', () => {

    })
});
describe('then', () => {
    it('then is a function', () => {
        const simplePromise = new SimplePromise();
        expect(typeof simplePromise.then).to.equal('function');
    })
    it('catch is a function', () => {
        const simplePromise = new SimplePromise();
        expect(typeof SimplePromise.catch).to.equal('function');
    })
})