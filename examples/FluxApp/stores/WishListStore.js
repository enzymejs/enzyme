import alt from '../alt';

import WishListActions from '../actions/WishListActions';

class WishListStore {
  constructor() {
    this.bindListeners({
      onAddToWishListSuccess: [
        WishListActions.addToWishListSuccess,
      ],
      onRemoveFromWishListSuccess: [
        WishListActions.removeFromWishListSuccess,
      ]
    });
    this.exportPublicMethod({
      isInWishlist: this.isInWishlist,
    });
    this.wishlist = [];
  }

  isInWishlist(id) {
    return this.wishlist.indexOf[id] !== -1;
  }

  add(id) {
    if (!this.isInWishlist(id)) {
      this.wishlist.push(id);
    }
  }

  remove(id) {
    if (this.isInWishlist(id)) {
      this.wishlist.splice(this.wishlist.indexOf(id), 1);
    }
  }

  onAddToWishListSuccess(listingId) {
    this.add(listingId);
  }

  onRemoveFromWishListSuccess(listingId) {
    this.remove(listingId);
  }

}

export default alt.createStore(WishListStore, 'WishListStore');