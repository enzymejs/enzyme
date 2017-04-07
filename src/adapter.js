let initializedAdapter;
import { REACT15 } from './version';

if (!REACT15) {
  throw new Error('TODO set up a way to toggle between versions');
}

export function configureAdapter({ adapter }) {
  initializedAdapter = adapter;
}

export function getAdapter() {
  return initializedAdapter;
}
