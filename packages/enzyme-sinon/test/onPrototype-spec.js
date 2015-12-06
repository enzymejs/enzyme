import { expect } from 'chai';
import sinon from 'sinon';
import onPrototype from '../src/onPrototype';

describe('onPrototype', () => {

  it('makes the expected calls', () => {

    class Foo {
      a() {}
      b() {}
      componentDidUpdate() {}
    }

    const lifecycleSpy = sinon.spy();
    const methodSpy = sinon.spy();

    onPrototype(Foo, lifecycleSpy, methodSpy);

    expect(lifecycleSpy.callCount).to.equal(1);
    expect(lifecycleSpy.args[0][0]).to.equal(Foo.prototype);
    expect(lifecycleSpy.args[0][1]).to.equal('componentDidUpdate');

    expect(methodSpy.callCount).to.equal(2);
    expect(methodSpy.args[0][0]).to.equal(Foo.prototype);
    expect(methodSpy.args[0][1]).to.equal('a');
    expect(methodSpy.args[1][1]).to.equal('b');

  });

});
