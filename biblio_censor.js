/*jshint
    esversion: 6,
    unused: strict,
    undef: true,
    browser: true,
    devel: true
*/
/*globals
    MessageBot
*/

MessageBot.registerExtension('bibliofile/censoring', function(ex, world) {
    function getList() {
        return world.storage.getObject('biblio_censor_list', []);
    }
    function getMessage() {
        return world.storage.getString('biblio_censor_message', '/kick {{NAME}}');
    }


    function censorChecker(info) {
        if (info.player.isStaff()) {
            return; //Don't check staff messages
        }

        var normal = normalizeMessage(info.message);
        if (getList().some(function(word) { return normal.includes(normalizeMessage(word)); })) {
            ex.bot.send(getMessage(), {
                name: info.player.getName()
            });
        }
    }
    world.onMessage.sub(censorChecker);
    ex.uninstall = function() {
        world.storage.clearNamespace('biblio_censor_');
        world.onMessage.unsub(censorChecker);
    };

    function normalizeMessage(message) {
        function filter(c) {
            function check(characters) {
                return characters.some(function(test) {
                    return test == c;
                });
            }
            if (check(['æ', 'ä', 'å', 'á', 'à', 'ã', 'â', 'ā'])) {
                return 'a';
            } else if (check(['ß'])) {
                return 'b';
            } else if (check(['ç', 'č', 'ć'])) {
                return 'c';
            } else if (check(['é', 'ê', 'è', 'ë', 'ę', 'ė', 'ē'])) {
                return 'e';
            } else if (check(['î', 'ï', 'í', 'ī', 'į', 'Ì'])) {
                return 'i';
            } else if (check(['ł'])) {
                return 'l';
            } else if (check(['ñ', 'ń'])) {
                return 'n';
            } else if (check(['œ', 'ö', 'ó', 'õ', 'ô', 'ø', 'ò', 'ō'])) {
                return 'o';
            } else if (check(['ś', 'š'])) {
                return 's';
            } else if (check(['ü', 'ù', 'ú', 'û', 'ū'])) {
                return 'u';
            } else if (check(['ÿ'])) {
                return 'y';
            } else if (check(['ż', 'ź', 'ž'])) {
                return 'z';
            }

            return c;
        }

        message = message.toLocaleLowerCase();
        var filtered = '';
        for (var i = 0; i < message.length; i++) {
            filtered += filter(message[i]);
        }
        return filtered.replace(/[ \t]/g, '');
    }

    // Browser only
    if (ex.isNode || !ex.bot.getExports('ui')) return;


    var ui = ex.bot.getExports('ui');
    var tab = ui.addTab('Censoring');
    tab.innerHTML = '<style>#biblio_censor textarea{overflow: hidden; min-height: 30px; resize: none; width: 100%;}</style><div id="biblio_censor" class="container"> <h3 class="title">Censoring</h3> <p>When any of the words in the list below are said, say</p><input class="input"> <p>Messages from staff will not be checked.</p><hr> <p>One word per line, if you put the word "doodle" and someone says "d&oslash;odle", it will be caught.</p><textarea></textarea></div>';
    tab.querySelector('input').value = getMessage();
    tab.querySelector('textarea').value = getList().join('\n');

    tab.querySelector('textarea').addEventListener('keyup', function(e){
        var el = e.target;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    });

    tab.addEventListener('input', function() {
        world.storage.set('biblio_censor_message', tab.querySelector('input').value);
        world.storage.set('biblio_censor_list', tab.querySelector('textarea').value.split('\n').filter(function(v) {
            return v.length > 1;
        }));
    });

    ex.uninstall = function() {
        world.storage.clearNamespace('biblio_censor_');
        world.onMessage.unsub(censorChecker);
        ui.removeTab(tab);
    };
});
