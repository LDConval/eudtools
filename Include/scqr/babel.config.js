module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    "chrome": "50",
                    "firefox": "50",
                    "edge": "50",
                    "opera": "50"
                },
            },
        ]
    ];
    const plugins = [ ];

    return {
        presets,
        plugins
    };
};