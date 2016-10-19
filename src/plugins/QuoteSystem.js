// Author: Cristian Achille
// Date: 19-10-2016

import Plugin from '../Plugin';
import Util from '../Util';
import redis from 'redis';

export default class QuoteSystem extends Plugin {

    static get plugin() {
        return {
            name: 'QuoteSystem',
            description: 'A classic Quote system such as the famous one for eggdrop',
            help: ` commands: 
                \`/addquote\` adds the replied message 
                \`/quote <id>\` returns the quote by ID
                \`/quote\` returns a random quote`
        };
    }

    client = null;
    KEY = 'plugin_quote'

    start() {
        this.client = redis.createClient();
    }

    onText(message, reply) {
        let parts = Util.parseCommand(message.text, ['addquote', 'quote']);
        if (parts === null)
            return;
        if (parts[0] === 'addquote') {
            this.addQuote(message, reply);
        } else if (parts[0] === 'quote') {
            if (parts[1] === undefined) {
                this.randomQuote(reply);
            } else {
                this.findQuote(parts[1], reply);
            }
        }
    }

    addQuote(message, reply) {
        this.client.hincrby(this.KEY, ['count', 1], err => {
            if (err !== null) {
                this.log.error(err);
                return;
            }
            this.client.hget(this.KEY, ['count'], (err, obj) => {
                if (err !== null) {
                    this.log.error(err);
                    return;
                }
                if (message.reply_to_message === undefined) {
                    if (message.reply_to_message.text === undefined) {
                        reply({type: 'text', text: 'Please reply to a text message first'});
                        return;
                    }
                }

                console.log(message);
                let count = obj;
                let author = message.reply_to_message.from.username;
                let quote = message.reply_to_message.text;

                if (author === undefined) {
                    author = message.reply_to_message.from.first_name;
                } else {
                    author = "@"+author
                }
                this.client.hmset(this.KEY, [count + 'by', author, count + 'quote', quote]);
                reply({type: 'text', text: 'Quote added, ID is ' + count});
                return;
            });
        });
    }

    findQuote(id, reply) {
        this.client.hget(this.KEY, [id + 'by'], (err, obj) => {
            if (err !== null) {
                this.log.error(err);
                return;
            }

            if (obj) {
                let username = obj;
                this.client.hget(this.KEY, [id + 'quote'], (err, obj) => {
                    if (err !== null) {
                        this.log.error(err);
                        return;
                    }
                    let quote = obj;
                    reply({type: 'text', text: '<' + username + '> : ' + quote});
                    return;
                });
            } else {
                reply({type: 'text', text: "id not found"});
            }
        });
    }

    randomQuote(reply) {
        this.client.hget(this.KEY, ['count'], (err, obj) => {
            if (err !== null) {
                this.log.error(err);
                return;
            }
            let id = Math.floor(Math.random() * obj) + 1;
            this.findQuote(id, reply);
        });
    }
}
