import { expect } from 'chai';
import getAdapterForReactVersion from 'enzyme-adapter-react-helper/build/getAdapterForReactVersion';

describe('enzyme-adapter-react-helper', () => {
  describe('getAdapterForReactVersion', () => {
    it('returns "enzyme-adapter-react-17" when intended', () => {
      expect(getAdapterForReactVersion('17.0.0')).to.equal('enzyme-adapter-react-17');
    });

    it('returns "enzyme-adapter-react-16" when intended', () => {
      expect(getAdapterForReactVersion('16')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.8')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.8.0-alpha.1')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.8.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.8.6')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.7')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.7.0-alpha.2')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.7.0')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.6')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.6.0-alpha.8af6728')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.6.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.6.3')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.5')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.5.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.5.2')).to.equal('enzyme-adapter-react-16');

      expect(getAdapterForReactVersion('16.4')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.4.0-alpha.0911da3')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.4.0')).to.equal('enzyme-adapter-react-16');
      expect(getAdapterForReactVersion('16.4.2')).to.equal('enzyme-adapter-react-16');
    });

    it('returns "enzyme-adapter-react-16.3" when intended', () => {
      expect(getAdapterForReactVersion('16.3')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.0-alpha.3')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.0-rc.0')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.0')).to.equal('enzyme-adapter-react-16.3');
      expect(getAdapterForReactVersion('16.3.2')).to.equal('enzyme-adapter-react-16.3');
    });

    it('returns "enzyme-adapter-react-16.2" when intended', () => {
      expect(getAdapterForReactVersion('16.2')).to.equal('enzyme-adapter-react-16.2');
      expect(getAdapterForReactVersion('16.2.0')).to.equal('enzyme-adapter-react-16.2');
    });

    it('returns "enzyme-adapter-react-16.1" when intended', () => {
      expect(getAdapterForReactVersion('16.1')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.0-beta.1')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.0-rc')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.0')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.1.1')).to.equal('enzyme-adapter-react-16.1');

      expect(getAdapterForReactVersion('16.0')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.0.0-alpha.13')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.0.0-beta.5')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.0.0-rc.3')).to.equal('enzyme-adapter-react-16.1');
      expect(getAdapterForReactVersion('16.0.0')).to.equal('enzyme-adapter-react-16.1');
    });

    it('returns "enzyme-adapter-react-15" when intended', () => {
      expect(getAdapterForReactVersion('15')).to.equal('enzyme-adapter-react-15');

      expect(getAdapterForReactVersion('15.6')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.6.0-rc.1')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.6.0')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.6.1')).to.equal('enzyme-adapter-react-15');

      expect(getAdapterForReactVersion('15.5')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.5.0-rc.2')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.5.0')).to.equal('enzyme-adapter-react-15');
      expect(getAdapterForReactVersion('15.5.4')).to.equal('enzyme-adapter-react-15');
    });

    it('returns "enzyme-adapter-react-15.4" when intended', () => {
      expect(getAdapterForReactVersion('15.4')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.4.0-rc.4')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.4.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.4.2')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.3')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.0-rc.3')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.1-rc.2')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.1')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.2-rc.1')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.3.2')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.2')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.2.0-rc.2')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.2.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.2.1')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.1')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.1.0-alpha.1')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.1.0')).to.equal('enzyme-adapter-react-15.4');

      expect(getAdapterForReactVersion('15.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.0.0')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.0.2')).to.equal('enzyme-adapter-react-15.4');
      expect(getAdapterForReactVersion('15.0.3-alpha.2')).to.equal('enzyme-adapter-react-15.4');
    });

    it('returns "enzyme-adapter-react-14" when intended', () => {
      expect(getAdapterForReactVersion('0.14')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.0-alpha3')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.0-beta3')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.0-rc1')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.0')).to.equal('enzyme-adapter-react-14');
      expect(getAdapterForReactVersion('0.14.8')).to.equal('enzyme-adapter-react-14');
    });

    it('returns "enzyme-adapter-react-13" when intended', () => {
      expect(getAdapterForReactVersion('0.13')).to.equal('enzyme-adapter-react-13');
      expect(getAdapterForReactVersion('0.13.0-alpha.2')).to.equal('enzyme-adapter-react-13');
      expect(getAdapterForReactVersion('0.13.0-beta.2')).to.equal('enzyme-adapter-react-13');
      expect(getAdapterForReactVersion('0.13.0-rc2')).to.equal('enzyme-adapter-react-13');
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
