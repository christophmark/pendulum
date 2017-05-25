# pendulum

A physics-inspired 2D browser game for both mobile and desktop that involves an alien swinging from a rope to avoid obstacles in randomly generated, fully destructible levels. [Click here to play!](https://christophmark.github.io/pendulum/pendulum/index.html)

![demo-video](https://raw.githubusercontent.com/christophmark/pendulum/master/demo/demo-video.gif)

## Mobile
On mobile, touch the screen and hold to swing from the alien's rope. A red disk will appear around the touch position. Move the finger out of this disk to fire bullets in the corresponding direction. Move the finger back on the disk to reload. Release to cut the rope.

**Note:** Due to the calculations done by the physics library `p2.js` for the rope dynamics, the performance may vary on mobile. Pendulum runs smoothly on newer generation iPhones (tested on 6/7).

## Desktop
When playing the game using a desktop browser, press and hold `SPACE` to swing from the alien's rope. While the rope is active, click anywhere within the game window to fire bullets in the corresponding direction. Release `SPACE` to cut the rope.

## About the game
Pendulum is based on the HTML5 game framework [Phaser](https://phaser.io/). It currently features 100 levels that are randomly generated based on [Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) (implemented in [Python](https://www.python.org/) using the module [`noise`](https://pypi.python.org/pypi/noise/)).

![random-levels](https://raw.githubusercontent.com/christophmark/pendulum/master/demo/random-levels.png)

Pendulum uses the physics engine [`p2.js`](https://github.com/schteppe/p2.js) to allow for realistic *Tarzan-like* rope dynamics. It further features fully destructible terrain together with a custom-made collision detection method. This enables the player to shoot tunnels into obstructed levels while swinging from the cave ceiling.

![destrucible-terrain-collision](https://raw.githubusercontent.com/christophmark/pendulum/master/demo/destrucible-terrain-collision.png)

## License

The game Pendulum itself is released under the MIT License. Please note that the Carrier Command bitmap font (PNG and XML files) is not covered by the MIT License. The font is part of the [Phaser 2 Examples Repository](https://github.com/photonstorm/phaser-examples) and is therefore not to be used in commercial games. © 2017 [Photon Storm Limited](http://www.photonstorm.com/)

Furthermore, I would like to attribute the following authors of great game graphics that I used as a basis for the pendulum graphics. The pendulum graphics fall under the MIT License. This is possible as the original graphics were released under the [CC0 License](https://creativecommons.org/publicdomain/zero/1.0/).

- The explosion sprites are based on these [game effect sprites](https://opengameart.org/content/explosion-effects-and-more) by [Soluna Software](https://opengameart.org/users/soluna-software).

- The player graphics are based on the [Platformer Graphics (Deluxe)](https://opengameart.org/content/platformer-art-deluxe) by [Kenney Vleugels](www.kenney.nl).











