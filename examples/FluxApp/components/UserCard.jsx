import React, { PropTypes } from 'react';
import I18n from 'airbnb-i18n-polyglot';
import UserShape from '../shapes/UserShape';
import SizeEnumShape from '../shapes/SizeEnumShape';
import { squareImageSize } from '../utils/image-utils';

const propTypes = {
  user: UserShape.isRequired,
  size: SizeEnumShape,
};

const defaultProps = {
  size: 'md',
};

class UserCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user, size } = this.props;
    return (
      <div className={`user-card ${size}`}>
        <img
          className="user-card-image"
          src={user.image}
          {...squareImageSize(size)}
          />

        <div>{user.name}</div>
      </div>
    );
  }
}

UserCard.propTypes = propTypes;
UserCard.defaultProps = defaultProps;

export default UserCard;