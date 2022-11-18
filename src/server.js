var radius = require('radius');
var dgram = require("dgram");

var secret = 'Afwefewfew4334r433fweefregrerfwfwfewfew';
var server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
    var code, username, password, vlan, packet;
    packet = radius.decode({ packet: msg, secret: secret });

    if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code);
        return;
    }

    username = packet.attributes['User-Name'];
    password = packet.attributes['User-Password'];

    console.log('Access-Request for ' + username);

    /*
    if (username == 'jlpicard' && password == 'beverly123') {
      code = 'Access-Accept';
    } else {
      code = 'Access-Reject';
    }
    */

    vlan = '2'

    var response = radius.encode_response({
        packet: packet,
        code: 'Access-Accept',
        secret: secret,
        attributes: [
            ['Acct-Interim-Interval', '3600'],
            ['Tunnel-Type', 'VLAN'],
            ['Tunnel-Medium-Type', 'IEEE-802'],
            ['Tunnel-Private-Group-Id', vlan],
        ]
    });

    console.log('Sending ' + code + ' for user ' + username);
    server.send(response, 0, response.length, rinfo.port, rinfo.address, function (err, bytes) {
        if (err) {
            console.log('Error sending response to ', rinfo);
        }
    });
});

server.on("listening", function () {
    var address = server.address();
    console.log("radius server listening " +
        address.address + ":" + address.port);
});

server.bind(1812);