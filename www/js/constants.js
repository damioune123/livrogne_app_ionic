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
    url: 'http://127.0.0.1/ivrogne_api_raspberry/web/app_dev.php/api'
})
.constant('NODE', {
   url: 'http://127.0.0.1:5000'
});


