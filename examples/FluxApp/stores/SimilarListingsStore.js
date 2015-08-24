import alt from '../alt';
import {
  fetchSimilarListingsRetrieved
} from '../actions/SimilarListingsActions';

class SimilarListingsStore {
  constructor() {
    this.bindListeners({
      onFetchSimilarListingsRetrieved: [
        SimilarListingsActions.fetchSimilarListingsRetrieved
      ],
    });
    //this.exportPublicMethod({
    //  get: this.get,
    //});
    this.similar = {};
  }

  static get(listingId) {
    return this.similar[listingId] || [];
  }
  set(listingId, listings) {
    this.similar[listingId] = listings;
  }

  onFetchSimilarListingsRetrieved({ listingId,  listings }) {
    this.set(listingId, listings);
  }

}

export default alt.createStore(SimilarListingsStore, 'SimilarListingsStore');