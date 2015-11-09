import React, { PropTypes } from 'react';

export default PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
});

export var mock = (casual) => ({
  id: casual.integer,
  name: casual.name,
  image: casual.url,
});