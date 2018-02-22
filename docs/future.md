# Future Work

Discussion of additional features and support for enzyme should be initiated by opening a
[GitHub issue](https://github.com/airbnb/enzyme/issues).

There are several things we'd like to address with enzyme that often get asked. Here are a couple
of projects that we plan on addressing in the near future:


#### Improved event simulation and propagation support

Event simulation is limited for Shallow rendering. Event propagation is not supported, and one must
supply their own event objects. We would like to provide tools to more fully simulate real
interaction.


### Improved Keyboard + Mouse Simulation

Many react components involve simulating form input or complex mouse interaction. Simulating this
using the event simulation API that enzyme provides is cumbersome and impractical. We are looking for
an expressive way to solve this problem, even if it is a library that lives outside of enzyme.
