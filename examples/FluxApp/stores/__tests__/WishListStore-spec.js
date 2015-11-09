import React from 'react';
import { expect } from 'chai';
import casual from 'casual';
import alt from '../../alt';
import {
  useSinon,
  dispatch,
  stubActions,
} from '../react';

import {
  useFlux,
  dispatch,
  clearFlux,
} from '../flux';

import WishListStore from '../../stores/WishListStore';
import WishListActions from '../../actions/WishListActions';

describe('WishListStore', () => {
  useSinon();

  //useFlux(alt);

  describe('isInAWishlist', () => {

    const add = listingId => dispatch(WishListActions.addToWishList, listingId);
    const remove = listingId => dispatch(WishListActions.removeFromWishList, listingId);

    it('should return true after an added listing', () => {
      expect(WishListStore.isInWishlist(123)).to.be.false;
      add(123);
      expect(WishListStore.isInWishlist(123)).to.be.true;
      expect(WishListStore.isInWishlist(124)).to.be.false;
    });

    it('should return false after removing ', () => {
      add(123);
      add(124);
      expect(WishListStore.isInWishlist(123)).to.be.true;
      expect(WishListStore.isInWishlist(124)).to.be.true;
      remove(123);
      expect(WishListStore.isInWishlist(123)).to.be.false;
      expect(WishListStore.isInWishlist(124)).to.be.true;
    });

  });

});