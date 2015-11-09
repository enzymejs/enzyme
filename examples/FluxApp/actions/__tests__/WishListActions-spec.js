import React from 'react';
import { expect } from 'chai';
import casual from 'casual';
import {
  useJsDom,
  useSinon,
  mount,
  shallow,
  render,
  simulate,
  stubActions,
} from '../';

import ListingCard from '../../components/ListingCard';
import UserCard from '../../components/UserCard';
import WishlistActions from '../../actions/WishListActions';
import { mock as ListingShape } from '../../shapes/ListingShape';

describe('WishListActions', () => {
  useSinon();

  describe('addToWishList', () => {

    it('should initiate an AJAX call', () => {

    });

  });



});