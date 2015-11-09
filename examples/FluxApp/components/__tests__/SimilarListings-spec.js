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

import SimilarListings from '../SimilarListings';
import ListingCard from '../ListingCard';
import UserCard from '../UserCard';
import { mock as ListingShape } from '../../shapes/ListingShape';

describe('<SimilarListings />', () => {
  //useJsDom();
  useSinon();

  const listing = ListingShape(casual);
  const listings = Array.apply(null, Array(10)).map(() => ListingShape(casual));

  it('should render N ListingCards', () => {
    const wrapper = shallow(
      <SimilarListings listings={listings} listingId={listing.id}/>
    );
    expect(wrapper.findAll(ListingCard).length).to.equal(listings.length);
  });

  it('should render nothing if no similar listings are found', () => {
    const wrapper = render(
      <SimilarListings listings={[]} listingId={listing.id} />
    );
    expect(wrapper.text().trim()).to.equal("");
  });

});

describe('<SimilarListings /> (connectToStores)', () => {

});