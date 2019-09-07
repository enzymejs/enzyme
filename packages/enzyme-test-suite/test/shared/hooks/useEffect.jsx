import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import {
  describeIf,
  itIf,
} from '../../_helpers';
import {
  is,
} from '../../_helpers/version';
import {
  useEffect,
  useState,
  Fragment,
} from '../../_helpers/react-compat';

export default function describeUseEffect({
  hasHooks,
  Wrap,
  isShallow,
}) {
  // TODO: enable when the shallow renderer fixes its bug, see https://github.com/facebook/react/issues/15275.
  describeIf(hasHooks && !isShallow, 'hooks: useEffect', () => {
    const timeout = 100;
    function ComponentUsingEffectHook() {
      const [ctr, setCtr] = useState(0);
      useEffect(() => {
        setCtr(1);
        setTimeout(() => {
          setCtr(2);
        }, timeout);
      }, []);
      return (
        <div>
          {ctr}
        </div>
      );
    }

    it('works', (done) => {
      const wrapper = Wrap(<ComponentUsingEffectHook />);

      expect(wrapper.debug()).to.equal(
        isShallow
          ? `<div>
  1
</div>`
          : `<ComponentUsingEffectHook>
  <div>
    1
  </div>
</ComponentUsingEffectHook>`,
      );

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.debug()).to.equal(
          isShallow
            ? `<div>
  2
</div>`
            : `<ComponentUsingEffectHook>
  <div>
    2
  </div>
</ComponentUsingEffectHook>`,
        );
        done();
      }, timeout + 1);
    });

    describe('with mount effect', () => {
      const didMountCount = 9;

      function FooCounterWithMountEffect({ initialCount = 0 }) {
        const [count, setCount] = useState(+initialCount);

        useEffect(() => {
          setCount(didMountCount);
        }, []);
        return (
          <Fragment>
            <span className="counter">
              {count}
            </span>
          </Fragment>
        );
      }

      it('initial render after did mount effect', () => {
        const wrapper = Wrap(<FooCounterWithMountEffect />);
        expect(wrapper.find('.counter').text()).to.equal(String(didMountCount));
      });
    });

    describe('with async effect', () => {
      it('works with `useEffect`', (done) => {
        const wrapper = Wrap(<ComponentUsingEffectHook />);

        expect(wrapper.debug()).to.equal(
          isShallow
            ? `<div>
  1
</div>`
            : `<ComponentUsingEffectHook>
  <div>
    1
  </div>
</ComponentUsingEffectHook>`,
        );

        setTimeout(() => {
          wrapper.update();
          expect(wrapper.debug()).to.equal(
            isShallow
              ? `<div>
  2
</div>`
              : `<ComponentUsingEffectHook>
  <div>
    2
  </div>
</ComponentUsingEffectHook>`,
          );
          done();
        }, timeout + 1);
      });
    });

    it('will receive Props', () => {
      function Foo(props) {
        const [fooVal, setFooVal] = useState('');
        const { initialFooVal } = props;
        useEffect(() => {
          setFooVal(initialFooVal);
        }, [initialFooVal]);

        return (
          <div>
            <p>{fooVal}</p>
          </div>
        );
      }

      const wrapper = Wrap(<Foo />);
      wrapper.setProps({ initialFooVal: 'hey' });
      expect(wrapper.find('p').text()).to.equal('hey');
    });

    describe('on componentDidUpdate & componentDidMount', () => {
      const expectedCountString = (x) => `You clicked ${x} times`;

      let setDocumentTitle;
      function ClickCounterPage() {
        const [count, setCount] = useState(0);

        useEffect(() => {
          setDocumentTitle(expectedCountString(count));
        }, [count]);

        return (
          <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
              Click me
            </button>
          </div>
        );
      }

      beforeEach(() => {
        setDocumentTitle = sinon.stub();
      });

      it('on mount initial render', () => {
        const wrapper = Wrap(<ClickCounterPage />);

        expect(wrapper.find('p').text()).to.eq(expectedCountString(0));
        expect(setDocumentTitle).to.have.property('callCount', 1);
        expect(setDocumentTitle.args).to.deep.equal([[expectedCountString(0)]]);
      });

      it('on didupdate', () => {
        const wrapper = Wrap(<ClickCounterPage />);

        expect(setDocumentTitle).to.have.property('callCount', 1);
        const [firstCall] = setDocumentTitle.args;
        expect(firstCall).to.deep.equal([expectedCountString(0)]);
        expect(wrapper.find('p').text()).to.equal(expectedCountString(0));

        wrapper.find('button').invoke('onClick')();

        expect(setDocumentTitle).to.have.property('callCount', 2);
        const [, secondCall] = setDocumentTitle.args;
        expect(secondCall).to.deep.equal([expectedCountString(1)]);
        expect(wrapper.find('p').text()).to.equal(expectedCountString(1));

        wrapper.find('button').invoke('onClick')();
        wrapper.find('button').invoke('onClick')();

        expect(setDocumentTitle).to.have.property('callCount', 4);
        const [,,, fourthCall] = setDocumentTitle.args;
        expect(fourthCall).to.deep.equal([expectedCountString(3)]);
        expect(wrapper.find('p').text()).to.equal(expectedCountString(3));
      });
    });

    describe('with cleanup Effect', () => {
      let ChatAPI;

      beforeEach(() => {
        ChatAPI = {
          subscribeToFriendStatus: sinon.stub(),
          unsubscribeFromFriendStatus: sinon.stub(),
        };
      });

      function FriendStatus({ friend = {} }) {
        const [isOnline, setIsOnline] = useState(null);

        function handleStatusChange(status) {
          setIsOnline(status.isOnline);
        }

        useEffect(() => {
          ChatAPI.subscribeToFriendStatus(friend.id, handleStatusChange);
          return function cleanup() {
            ChatAPI.unsubscribeFromFriendStatus(friend.id, handleStatusChange);
          };
        }, [isOnline]);

        if (isOnline === null) {
          return 'Loading...';
        }
        return isOnline ? 'Online' : 'Offline';
      }

      const friend = { id: 'enzyme' };

      it('on initial mount', () => {
        const wrapper = Wrap(<FriendStatus friend={friend} />);
        expect(wrapper.debug()).to.equal(
          `<FriendStatus friend={{...}}>
  Loading...
</FriendStatus>`,
        );
        expect(wrapper.html()).to.eql('Loading...');
        expect(ChatAPI.subscribeToFriendStatus.calledOnceWith(friend.id)).to.equal(true);
      });

      it('simulate status Change', () => {
        const wrapper = Wrap(<FriendStatus friend={friend} />);
        const [[, simulateChange]] = ChatAPI.subscribeToFriendStatus.args;

        simulateChange({ isOnline: true });

        wrapper.update();
        expect(wrapper.html()).to.eql('Online');
      });

      // TODO: figure out why this test is flaky. Perhaps unmount of useEffect is async?
      itIf.skip(is('> 16.8.3'), 'cleanup on unmount', () => {
        const wrapper = Wrap(<FriendStatus friend={friend} />);

        wrapper.unmount();

        expect(ChatAPI.unsubscribeFromFriendStatus).to.have.property('callCount', 1);
        const [[firstArg]] = ChatAPI.unsubscribeFromFriendStatus.args;
        expect(firstArg).to.equal(friend.id);
      });
    });
  });
}
