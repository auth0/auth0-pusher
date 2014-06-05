## A simple example using Pusher & Auth0

This is a single page application (SPA) that will authenticate users using any of [Auth0 supported identity providers](https://docs.uth0.com/identityproviders) and then upon successful authentication will subscribe to a private events channel.

### How it works?
The sample uses the Pusher JS API to subscribe to a `private channel` and then binds to `new-message` events.

```
var pusher = new Pusher('3dc9278e1b763c7e1eeb', { authTransport: 'ajax'});
var privateChannel = pusher.subscribe('private-channel-123');

privateChannel.bind('pusher:subscription_error', function(status){
    alert(status);
});

privateChannel.bind('new-message', function(data) {
    alert(data);
});
```

At the same time, we are overriding the `authorize` function of `PrivateChannel` so authentication happens through Auth0:

```
Pusher.PrivateChannel.prototype.authorize = function (socketId, callback) {
    
    widget.signin({ popup: true, extraParameters: { 
        socket_id: socketId,
        channel: 'private-channel-123'
    },
        access_type: 'offline'
    }, null, function(err, profile, token) {
        if (err) {
            console.log("There was an error");
            return alert("There was an error logging in");
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
```

The Pusher authentication token is computed in an Auth0 Rule for the app and returned in the `pusherAuth` property of the user profile.

Notice that the `Login Widget` receives two extra parameters: `socket_id` and `channel`. These are used to compute the token following [Pusher documentation](http://pusher.com/docs/auth_signatures).

Both are availabe in the `context.request.query` object in the rule:

```
function (user, context, callback) {
  
  var pusherKey='YOUR PUSHER KEY';
  var pusherSecret = '{YOUR PUSHER SECRET}';
  console.log(context.request.query.socket_id);
  
  if( context.request.query.channel && context.request.query.socket_id)
  {
    user.pusherAuth = pusherKey + ":" + sign(pusherSecret, context.request.query.channel, context.request.query.socket_id);
  }
  
  callback(null, user, context);
  
  function sign(secret, channel, socket_id)
  {
    var string_to_sign = socket_id+":"+channel;
    console.log(string_to_sign);
    var sha = crypto.createHmac('sha256',secret);
    return sha.update(string_to_sign).digest('hex');
  }
}
```

> The sample is not considering any error conditions. 
