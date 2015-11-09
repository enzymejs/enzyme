import React, { PropTypes } from 'react';
import UserShape, { mock as UserMock } from './UserShape';

export default PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  host: UserShape.isRequired,
});

export var mock = (casual) => ({
  id: casual.integer,
  name: casual.title,
  host: UserMock(casual),
});