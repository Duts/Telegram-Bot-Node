/*
    DESCRIPTION: 
        Ping - pong

    AUTHOR: 
        Cristian Baldi

    COMMANDS:
        ping

    EXAMPLE:
        You: ping
        Bot: pong
*/

var pingN = function(){

    this.help = {
        shortDescription: "Ping - Pong",
        fullHelp: "Send `ping`, get `pong`\nIf only life was _this_ easy."
    };

    this.on("text", function (msg, reply){
        if (msg.text.toLowerCase() == "ping")
            reply({type: 'text', text: 'pong'}); 
    });

};

module.exports = pingN;