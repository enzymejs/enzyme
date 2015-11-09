import React, { PropTypes } from 'react';
import connectToStores from 'alt/utils/connectToStores';
import I18n from 'airbnb-i18n-polyglot';
import ListingShape from '../shapes/ListingShape';
import SimilarListingsStore from '../stores/SimilarListingsStore';

const propTypes = {
  listingId: PropTypes.number.isRequired,
  listings: PropTypes.arrayOf(ListingShape).isRequired,
};

export class SimilarListings extends React.Component {

  static getStores() {
    return [SimilarListingsStore];
  }

  static getPropsFromStores(props) {
    return {
      listings: SimilarListingsStore.get(props.listingId),
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { listings } = this.props;
    return (
      <div className="similar-listings">
        <h3>{I18n.t('Similar Listings')}</h3>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            size="md"
          />
        ))}
      </div>
    );
  }
}

SimilarListings.propTypes = propTypes;

export default connectToStores(SimilarListings);