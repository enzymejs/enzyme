import { expect } from 'chai';
import getAdapterForReactVersion from 'enzyme-adapter-react-helper/src/getAdapterForReactVersion';

describe('enzyme-adapter-react-helper', () => {
  describe('getAdapterForReactVersion', () => {
    it('returns "enzyme-adapter-react-16" for 16.4 and up', () => {
      expect(getAdapterForReactVersion('16.8')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.8.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.8.6')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.7')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.7.0')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.6')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.6.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.6.3')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.5')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.5.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.5.2')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.4')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.4.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.4.2')).to.equal('enzyme-adapter-react-16');
    });

    it('returns "enzyme-adapter-react-16.3" for 16.3', () => {
      expect(getAdapterForReactVersion('16.3')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.0')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.2')).to.equal('enzyme-adapter-react-16.3');
    });

    it('returns "enzyme-adapter-react-16.2" for 16.2', () => {
      expect(getAdapterForReactVersion('16.2')).to.equal('enzyme-adapter-react-16.2');
      expect(getAdapterForReactVersion('16.2.0')).to.equal('enzyme-adapter-react-16.2');
    });

    it('returns "enzyme-adapter-react-16.1" for 16.0 and 16.1', () => {
      expect(getAdapterForReactVersion('16.1')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.0')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.1')).to.equal('enzyme-adapter-react-16.1');

      expect(getAdapterForReactVersion('16.0')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.0.0')).to.equal('enzyme-adapter-react-16.1');
    });

    it('returns "enzyme-adapter-react-15" for 15.5', () => {
      expect(getAdapterForReactVersion('15.5')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.5.0')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.5.4')).to.equal('enzyme-adapter-react-15');
    });

    it('returns "enzyme-adapter-react-15.4" for 15.0, 15.1, 15.2, 15.3, and 15.4', () => {
      expect(getAdapterForReactVersion('15.4')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.4.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.4.2')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.3')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.2')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.2')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.2.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.2.1')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.1')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.1.0')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.0.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.0.2')).to.equal('enzyme-adapter-react-15.4');
    });

    it('returns "enzyme-adapter-react-14" for 0.14', () => {
      expect(getAdapterForReactVersion('0.14')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.0')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.8')).to.equal('enzyme-adapter-react-14');
    });

    it('returns "enzyme-adapter-react-13" for 0.13', () => {
      expect(getAdapterForReactVersion('0.13')).to.equal('enzyme-adapter-react-13');
      expect(getAdapterForReactVersion('0.13.0')).to.equal('enzyme-adapter-react-13');
      expect(getAdapterForReactVersion('0.13.3')).to.equal('enzyme-adapter-react-13');
    });

    it('throws an error for unrecognized versions', () => {
      const version = '1337';
      expect(() => getAdapterForReactVersion(version)).to.throw(
        RangeError,
        `No Enzyme adapter could be found for React version “${version}”`,
      );
    });
  });
});
