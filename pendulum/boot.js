var BasicGame = {};

BasicGame.Boot = function (game) {};

BasicGame.Boot.prototype = {

    init: function () {
        this.input.maxPointers = 1;  // only single-finger touch
        this.scale.pageAlignHorizontally = true;  // center game in browser window
    },

    preload: function () {
    },

    create: function () {
        this.state.start('Preloader');
    }
};
