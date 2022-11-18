import radius from 'radius';
import dgram from 'dgram';
import maclist from './mac.json' assert { type: "json" };

var secret = 'Afwefewfew4334r433fweefregrerfwfwfewfew';
var server = dgram.createSocket("udp4");

console.log(maclist)

server.on("message", function (msg, rinfo) {
    var code, mac, vlan, packet;
    packet = radius.decode({ packet: msg, secret: secret });

    if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code);
        return;
    }

    mac = packet.attributes['User-Name'];

    console.log('Access-Request for MAC:' + mac);


    if (maclist.includes(mac)) {
        console.log("Client from MAClist")
        vlan = '1'
    }
    else {
        vlan = '2'
        console.log("Guest Access")
    }

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