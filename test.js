var request = require('request');

var user = { 
	email: 'matiasw@auth0.com'
};

var context = {
	clientID: '4Mjk3Lt0Kaeks1NoQnTiUXJA8cP1xEm8'
};

rule(user,context,function(e,u,c){
	if(e) return console.log(e);
	console.log(u);
});


function rule(user, context, callback) {
  // run this only for "Appery Sample" client
  if (context.clientID !== '4Mjk3Lt0Kaeks1NoQnTiUXJA8cP1xEm8') return callback(null, user, context);
  
  var APPERY_DATABASE_ID = '52ee42e2e4b0e90bb1253e98';
  var PASSWORD_SECRET = 'n3qoihfoihfoiwmefoweihfqoiwefnoweimaowebfweuoifhe';
  var username = user.email || user.name || user.user_id;
  
  console.log(username);
  
  request.get({
    url: 'https://api.appery.io/rest/1/db/login',
    qs: {
      username: username,
      password: PASSWORD_SECRET
    },
    headers: {
      'X-Appery-Database-Id': APPERY_DATABASE_ID
    }
  }, 
  function (err, response, body) {
    if (err) return callback(err);
    
    console.log(response.statusCode);

    // user was found, add sessionToken to user profile
    if (response.statusCode === 200) {
      user.appery_session_token = JSON.parse(body).sessionToken;
      return callback(null, user, context);
    }
    
    // user don't exist, create it
    if (response.statusCode === 404) {
      console.log('not found');
      request.post({
        url: 'https://api.appery.io/rest/1/db/users',
        json: {
          username: username,
          password: PASSWORD_SECRET
        },
        headers: {
          'X-Appery-Database-Id': APPERY_DATABASE_ID
        }
      }, 
      function (err, response, body) {
        if (err) return callback(err);

        // user created, add sessionToken to user profile
        if (response.statusCode === 200) {
          user.appery_session_token = body.sessionToken;
          return callback(null, user, context);
        }

      });
    }
  });
}