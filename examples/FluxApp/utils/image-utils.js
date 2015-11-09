export function square(size) {
  return { width: size, height: size };
}

export function squareImageSize(size) {
  switch (size) {
    case "sm":
      return square(64);
    case "md":
      return square(128);
    case "lg":
      return square(184);
    default:
      throw new TypeError(`Enum not recognized: ${size}`);
  }
}

export function imageSize(size) {
  switch (size) {
    case "sm":
      return { width: 96, height: 64 };
    case "md":
      return { width: 160, height: 128 };
    case "lg":
      return { width: 184, height: 184 };
    default:
      throw new TypeError(`Enum not recognized: ${size}`);
  }
}