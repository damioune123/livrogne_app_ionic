angular.module('livrogne-app')

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
        super_admin: 'ROLE_SUPER_ADMIN',
        barman:'ROLE_BARMAN',
        admin: 'ROLE_ADMIN',
        user: 'ROLE_USER'
    })
.constant('API', {
    url: 'http://[2a02:1811:3609:1bf1:41d0:1ae8:50f1:c776]/ivrogne_api_raspberry/web/app_dev.php/api'
});

