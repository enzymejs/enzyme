import alt from '../alt';
import Api from '../utils/api';

class WishListActions {
  constructor() {
    this.generateActions(
      // 'addToWishlist',
      'addToWishListSuccess',
      'addToWishListFail',
      'addToWishListDone',

      // 'removeFromWishlist',
      'removeFromWishListSuccess',
      'removeFromWishListFail',
      'removeFromWishListDone'
    );
  }

  addToWishList(listingId) {
    this.dispatch(listingId);
    Api.post(`/wishlist/add`, { listingId })
      .then(this.actions.addToWishListSuccess)
      .catch(this.actions.addToWishListFail)
      .then(this.actions.addToWishListDone);
  }

  removeFromWishList(listingId) {
    this.dispatch(listingId);
    Api.post(`/wishlist/remove`, listingId)
      .then(this.actions.removeFromWishListSuccess)
      .catch(this.actions.removeFromWishListFail)
      .then(this.actions.removeFromWishListDone);
  }

}

export default alt.createActions(WishListActions, 'WishListActions');