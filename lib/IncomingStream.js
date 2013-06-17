/************************************************************************
 * Internal Node Modules 
 ***********************************************************************/
var events          = require('events');
var util            = require('util');

/************************************************************************
 * External Dependencies 
 ***********************************************************************/
var WebSocketClient = require('websocket').client;  //Websockets

/************************************************************************
 * Internal Dependencies 
 ***********************************************************************/
var Constants       = require('./Constants');


/************************************************************************
 * Private Constants
 ***********************************************************************/
//These are internal states, and also messages that can be emitted:
const STATE_DISCONNECTED = "disconnected";
const STATE_PENDING      = "pending";
const STATE_CONNECTED    = "connected";

/*

    access_token [required] - your application API token for authentication purposes
    userid       [required] - your userid, used to subscribe to your push messages
    groupids     [optional] - an array of groupids to get partial updates from
*/
function IncomingStream(access_token, userid, groupids) {
    this.access_token = access_token;
    this.userid = userid;
    this.groupids = groupids;

    this.client = new WebSocketClient();
    this.connection = null;
    this.socketId = 1;

    this.state = STATE_DISCONNECTED;

    var self = this;

    var connectionInitHelper = function(connection) {

      connection.on('close', function(reasonCode, description) {
        self.emit('status', 'Websocket Disconnected.', description);
        this.connection = null;
        self.setState(STATE_DISCONNECTED);        
      });

      connection.on('error', function(error) {
        self.handleError("Websocket experienced error.", error);
        self.setState(STATE_DISCONNECTED);
      })
        
      connection.on('message', function(msg) {
        if (msg.type === 'utf8' && msg.utf8Data) {
          
          self.emit('status', 'Received:', msg);
          each(JSON.parse(msg.utf8Data), function(data) {

            if (data["channel"] == "/meta/handshake") {
              self.handshakeResponse(data);
            } else if (data["channel"] == "/meta/subscribe") {
              self.subscribeResponse(data);
            } else {
              self.emit('message', data);
            }

          });

        } else {
          self.emit('error','Received a non-utf8 message.', msg);
        }
      });

      return connection;

    }

    this.client.on('connect', function(connection) {
      self.setState(STATE_PENDING);  
      self.connection = connectionInitHelper(connection);
      self.emit('status', 'Websocket Connected');
      self.handshake();
    });

    this.client.on('connectFailed', function(errorDescription) {
      self.setState(STATE_DISCONNECTED);
      self.connection = null;
      self.emit('error', 'Connection Failed', err);
    });


};

util.inherits(IncomingStream, events.EventEmitter);

/************************************************************************
 * Externally-used API
 ***********************************************************************/

IncomingStream.prototype.connect = function() {
    this.client.connect(Constants.WEBSOCKETS_BASEURL);    
};

IncomingStream.prototype.disconnect = function() {
  if (this.connection)
    this.connection.close();
  this.emit('status', 'Sending disconnect request to server.')
}


/************************************************************************
 * Internal functions to handle handshaking
 ***********************************************************************/

IncomingStream.prototype.handleError = function(str, payload) {
  self.emit('error', str, payload);
}
IncomingStream.prototype.setState = function(state) {
  this.state = state;
  this.emit(state);
}
IncomingStream.prototype.handshake = function() {
    var data = {
      channel: '/meta/handshake',
      version: '1.0',
      supportedConnectionTypes: ['websocket','callback-polling']
    };
    this.send([data]);
};
IncomingStream.prototype.handshakeResponse = function(data) {
    if (data["successful"]) {
        this.emit('status', 'Handshake succeeded!');
        this.clientId = data["clientId"];
        this.subscribeUser();
    } else {
      this.emit('error','Handshake failed!');
    }
}
// Sends a request to listen for any messages to posed to
// the given userid. 
// Without this, we would receive no messages.
IncomingStream.prototype.subscribeUser = function() {
    var data = {
        channel: '/meta/subscribe',
        clientId: this.clientId,
        subscription: '/user/' + this.userid,
        ext: {
            access_token: this.access_token,
            timestamp: Date.now()
        }
    };
    this.send([data]);
}
// Catches the response 
IncomingStream.prototype.subscribeResponse = function(data) {
    if (data["successful"]) {
        this.startListening();
        if (data["subscription"] == '/user/' + this.userid && this.groupids) {
          this.subscribeGroups();
         }
    } else {
      this.emit('error', 'Subscribing to user or group failed!');
    }
}
// Sends a request to listen for in-progress typing notifications
// to the list of this.group_ids
IncomingStream.prototype.subscribeGroups = function() {
    var self = this;
    each(this.groupids, function(groupid) {
        var data = {
            channel: '/meta/subscribe',
            clientId: self.clientId,
            subscription: '/group/' + groupid,
            ext: {
                access_token: self.access_token,
                timestamp: Date.now()
            }
        };
        self.send([data]);        
    })

}
// Sends a request to listen
// Note: This is actually only necessary when you poll.
IncomingStream.prototype.startListening = function() {
    var data = {
        channel: '/meta/connect',
        clientId: this.clientId,
        connectionType: 'websocket',
    };
    this.send([data]);  
    this.setState(STATE_CONNECTED);
}

// Sends a json object to the server
// Appends a globally unique identifier
IncomingStream.prototype.send = function(data) {
    var self = this;
    each(data, function(d) {
      self.socketId++;
      d.id = self.socketId;
    });
    this.emit('status', 'Sending: ', data);
    this.connection.send(JSON.stringify(data));
};

var each = function(obj, iterator, context) {
    obj.forEach(iterator, context);
};

module.exports = IncomingStream;