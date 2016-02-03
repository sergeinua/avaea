'use strict';

avaeaStandaloneApp.controller('loginController',
    ['$scope', '$state', '$cookies', 'LoginService', LoginController ]);

    /**
     * Login controller init
     * @param $scope
     * @param $state
     * @param $cookies
     * @param AuthenticationService
     * @param Loginservice
     **/
    function LoginController($scope, $state, $cookies, LoginService) {

        $scope.gotoRegister = gotoRegister;
        $scope.login = login;
        $scope.logout = logout;
        $scope.register = registerUser;
        $scope.errorMessage;


        /**
         * Event triggered when state successfully changed,
         * or if user getting back to the WebPage after closing it.
         * @param event
         * @param callback
         * @return object
         */
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
            if (toState.name == 'register') {
                gotoRegister();
            } else {
                if (LoginService.isUserValid()) {
                    $scope.login({"token": $cookies.getAll().token});
                    event.preventDefault();
                } else {
                    return AuthenticationService.ClearCredentials(false);
                }
            }
            if ($('.md-dialog-is-showing')) {
                $('md-backdrop, .md-scroll-mask, .md-dialog-container').remove();
            }
        });


        /**
         * User login function
         * @param $auth
         */
        function login($auth) {

            AuthenticationService.Login($auth, function (res) {
                if (res && res.data && !res.data.error) {
                    res = res.data;
                    AuthenticationService.SetCredentials(res);
                } else {
                    $scope.errorMessage = res;
                }
            });
        }

        /**
         * Logout and delete cookies
         */
        function logout() {
            return AuthenticationService.ClearCredentials();
        }

        /**
         *Go to register page
         */

        function gotoRegister() {
            $state.go('register');
        }

        /**
         * User registration
         * @param $user
         */

        function registerUser($user) {
            $scope.errorMessage = '';
            AuthenticationService.Register($user, function (res) {
                if (res && res.config && res.config.data) {
                    if (res && res.status != 200) {
                        console.log(res.data);
                        $scope.errorMessage = (res.data && res.data.error) || 'Registration error';
                    } else if (res && res.config && res.config.data) {
                        res = res.config.data;
                        return login({"login": res.login, "password": res.password});
                    }
                }
            });

        }
    }

