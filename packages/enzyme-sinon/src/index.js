import Sinon from 'sinon';
import onPrototype from './onPrototype';

export let sinon = Sinon.sandbox.create();

export function spySetup() {
  sinon = Sinon.sandbox.create();
}

export function spyTearDown() {
  sinon.restore();
}

export function spyLifecycle(Component, sinonInstance = sinon) {
  onPrototype(Component, (proto, name) => sinonInstance.spy(proto, name));
}

export function spyMethods(Component, sinonInstance = sinon) {
  onPrototype(Component, null, (proto, name) => sinonInstance.spy(proto, name));
}
