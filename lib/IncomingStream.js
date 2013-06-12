/************************************************************************
 * Internal Node Modules 
 ***********************************************************************/
var events          = require('events');
var util            = require('util');

/************************************************************************
 * External Dependencies 
 ***********************************************************************/
var _               = require('underscore');        //Javascript functional programming helpers
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

    access_token [necessary] - your application API token for authentication purposes
    userid [necessary] - your userid, used to subscribe to your push messages
    groupids [optional] - an array of groupids to get partial updates from
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
      })
        
      connection.on('message', function(msg) {
        if (msg.type === 'utf8' && msg.utf8Data) {
          
          self.emit('status', 'Received:', msg);
          _.each(JSON.parse(msg.utf8Data), function(data) {

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

IncomingStream.prototype.handleError = function(str, payload) {
  self.emit('error', str, payload);
}
IncomingStream.prototype.setState = function(state) {
  this.state = state;
  this.emit(state);
}

IncomingStream.prototype.connect = function() {
    this.client.connect(Constants.WEBSOCKETS_BASEURL);    
};

IncomingStream.prototype.disconnect = function() {
  if (this.connection)
    this.connection.close();
  this.emit('status', 'Sending disconnect request to server.')
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
IncomingStream.prototype.subscribeResponse = function(data) {
    if (data["successful"]) {
        this.startListening();
        if (data["subscription"] == '/user/' + this.userid && this.groupids) {
          this.subscribeGroups();
          
        } else {
        }
        
    } else {
      this.emit('error', 'Subscribing to user or group failed!');
    }
}
IncomingStream.prototype.subscribeGroups = function() {
    var self = this;
    _.each(this.groupids, function(groupid) {
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
IncomingStream.prototype.startListening = function() {
    var data = {
        channel: '/meta/connect',
        clientId: this.clientId,
        connectionType: 'websocket',
    };
    this.send([data]);  
    this.setState(STATE_CONNECTED);
}

IncomingStream.prototype.send = function(data) {
    var self = this;
    _.each(data, function(d) {
      self.socketId++;
      d.id = self.socketId;
    });
    this.emit('status', 'Sending: ', data);
    this.connection.send(JSON.stringify(data));
};

module.exports = IncomingStream;