import React, { PropTypes } from 'react';
import I18n from 'airbnb-i18n-polyglot';
import ListingShape from '../shapes/ListingShape';
import SizeEnumShape from '../shapes/SizeEnumShape';
import { imageSize } from '../utils/image-utils';
import WishListActions from '../actions/WishListActions';
import UserCard from './UserCard';

const propTypes = {
  listing: ListingShape.isRequired,
  size: SizeEnumShape,
};

const defaultProps = {
  size: 'md',
};

class ListingCard extends React.Component {
  constructor(props) {
    super(props);
    this.onWishListClick = this.onWishListClick.bind(this);
  }

  onWishListClick() {
    WishListActions.addToWishList(this.props.listing.id);
  }

  render() {
    const { listing, size } = this.props;
    return (
      <div className="listing-card">
        <h3>{listing.title}</h3>
        <img
          className="listing-card-image"
          src={listing.image}
          {...imageSize(size)}
          />
        <button
          className="wishlist-button"
          onClick={this.onWishListClick}
          >
          {I18n.t('Add to Wishlist')}
        </button>
        <UserCard user={listing.host} size="sm" />
      </div>
    );
  }
}

ListingCard.propTypes = propTypes;
ListingCard.defaultProps = defaultProps;

export default ListingCard;