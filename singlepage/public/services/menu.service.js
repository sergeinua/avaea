'use strict';

avaeaStandaloneApp.service('MenuService', MenuService);

/**
 *Menu service init
 * @param $cookies
 */
    function MenuService($cookies) {

    var imagePath = 'img/list/60.jpeg', service = {};

    service.setDefaultMenu = SetMenu;

    return service;

    /**
     * Default menu set
     * @returns {{user: String, common: Array, options: Array}}
     */
    function SetMenu(){

        var defaultMenu = {
            common: [
                {
                    icon: imagePath,
                    id: 'home.reservation',
                    name: 'Reservations'
                },
                {
                    icon: imagePath,
                    id: 'home.searchAir',
                    name: 'Search Air'
                }
            ],

            options: [
                {
                    icon: imagePath,
                    id: 'home.options',
                    name: 'Options',
                    disabled: true
                }
            ]
        };
        var _menu = {
            common: defaultMenu.common,
            options: defaultMenu.options
        };
        return _menu;
    }

}