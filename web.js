var ack = require('ac-koa').require('hipchat');
var pkg = require('./package.json');
var app = ack(pkg);

var requests = [];

var addon = app.addon()
  .hipchat()
  .allowRoom(true)
  .scopes('send_notification');

if (process.env.DEV_KEY) {
  addon.key(process.env.DEV_KEY);
}
 
addon.webhook('room_message', /^\/add\s\w+/i, function *() {
    var request = this.sender.name;
    yield this.roomClient.sendNotification('Adding ' + request + ' to the list!');
    requests.push(request);
});

addon.webhook('room_message', /^\/list$/, function *() {
    yield this.roomClient.sendNotification('The List: \n' + requests.join(","));
});

addon.webhook('room_message', /^\/scrap$/, function *() {
    requests = [];
    yield this.roomClient.sendNotification('The list has been scrapped.');
});

addon.webhook('room_message', /^\/remove$/, function *() {
    var request = this.sender.name;
    var index = requests.indexOf(request);
    if (index > -1) {
        requests.splice(index, 1);
        yield this.roomClient.sendNotification(request + ' has been removed from the list.');
    } else {
        yield this.roomclient.sendNotification(request + ' is not on the list so it hasn\'t been removed.');
    }
});
 
app.listen();
