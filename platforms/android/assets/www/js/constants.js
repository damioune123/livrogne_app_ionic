angular.module('livrogne-app')

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
        super_admin: 'ROLE_SUPER_ADMIN',
        admin: 'ROLE_ADMIN',
        user: 'ROLE_USER'
    })
    .constant('API', {
        url: 'http://localhost/ivrogne_api_raspberry/web/app_dev.php/api'
    });
//
//
