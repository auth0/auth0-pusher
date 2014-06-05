$(document).ready(function() {
    var widget = new Auth0Widget({
        domain:         'eugeniopace.auth0.com',
        clientID:       'YBHeXTjJpSueSc3eiIrbYCHZGYUUBJDv',
        callbackURL:    window.location.origin,
        callbackOnLocationHash: true
    });

    
    $('.btn-login').click(function(e) {
        e.preventDefault();
        
        Pusher.PrivateChannel.prototype.authorize = function (socketId, callback) {
            
            widget.signin({ popup: true, extraParameters: { 
                socket_id: socketId,
                channel: 'private-channel-123'
            },
                access_type: 'offline'
            }, null, function(err, profile, token) {
                if(err){
                    console.log('There was an error logging in');
                    return callback(true, { status: 'Unauthorized'});
                } 
                $('.login-box').hide();
                $('.logged-in-box').show();
                $('.avatar').attr('src', profile.picture);
                $('.welcome').text('Welcome ' + profile.name);
                $('.nickname').text(profile.nickname);
                callback(false, {
                    auth: profile.pusherAuth
                });
            });

        };

        var pusher = new Pusher('3dc9278e1b763c7e1eeb', { authTransport: 'ajax'});
        var privateChannel = pusher.subscribe('private-channel-123');

        privateChannel.bind('pusher:subscription_error', function(status){
            alert(status);
        });

        privateChannel.bind('new-message', function(data) {
            alert(data);
        });
    });
});