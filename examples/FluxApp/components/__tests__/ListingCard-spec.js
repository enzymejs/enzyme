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

import ListingCard from '../ListingCard';
import UserCard from '../UserCard';
import WishlistActions from '../../stores/WishListActions';
import { mock as ListingShape } from '../../shapes/ListingShape';

describe('<ListingCard />', () => {
  useJsDom();
  useSinon();

  const listing = ListingShape(casual);

  it('should render the title', () => {
    const wrapper = render(<ListingCard listing={listing} />);
    expect(wrapper.text()).to.contain(listing.name);
  });

  it('should render the image', () => {
    const wrapper = render(<ListingCard listing={listing} />);
    const img = wrapper.find("img[src]");
    expect(img.attr("src")).to.equal(listing.image);
  });

  it('should render the user', () => {
    const wrapper = shallow(<ListingCard listing={listing} />);
    expect(wrapper.find(UserCard)).to.exist;
  });

  it('should trigger an action when the favorite button is clicked', () => {
    stubActions(WishlistActions);
    const wrapper = mount(<ListingCard listing={listing} />);
    simulate.click(wrapper.find(".wishlist-button"));
    expect(WishListActions.addToWishlist.calledOnce).to.be.true;
    expect(WishListActions.addToWishlist.calledWith(listing.id)).to.be.true;
  });

});