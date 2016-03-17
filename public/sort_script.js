function sortAndSave() {
    var DEBUG_LEVEL = 2;
    var a = null;

    function extractList(items) {
        a = [];
        for (var j = 0; j < items.length; j++) {
            var obj = {
                id: items[j].aid,
                after: (j > 0) ? items[j - 1].aid : null,
                before: (j < items.length - 1) ? items[j + 1].aid : null,
                fullName: items[j].artist + ' - ' + items[j].title
            };
            a[j] = obj;
        }
    }

    function print(s, container, clazz) {
        $(container ? container : 'body').append('<p class="' + clazz + '">' + s + '</p>');
    }

    function printList(container) {
        for (var i = 0; i < a.length; i++) {
            print('' + a[i].fullName + '', container);
        }
    }

    function sortList() {
        a.sort(function compare(a, before) {
            if (a.fullName < before.fullName) {
                return -1;
            }
            if (a.fullName > before.fullName) {
                return 1;
            }
            return 0;
        });
    }

    function recSaveSecond() {
        if (a.length >= 2) {
            if (a[1].id != a[0].before) {
                VK.api("audio.reorder", {
                    //after: a[0].id,
                    audio_id: a[0].id,
                    before: a[1].id
                }, function (data) {
                    if (data.response) {
                        if (DEBUG_LEVEL === 1) {
                            print(a[0].fullName, '.progress');
                        } else if (DEBUG_LEVEL === 2) {
                            print('reordered:  <b>' + a[0].fullName + '</b> -> ' + a[1].fullName, '.progress');
                        }
                        a.shift();
                        setTimeout(recSaveSecond, 333);
                    } else {
                        print('error:' + JSON.stringify(data.error), '.progress');
                    }
                });
            } else {
                if (DEBUG_LEVEL == 2) {
                    print('skip: ' + a[0].fullName, '.progress', 'skip');
                }
                a.shift();
                setTimeout(recSaveSecond, 0);
            }
        } else {
            if (a[0].id != a[1].after) {
                VK.api("audio.reorder", {
                    after: a[0].id,
                    audio_id: a[1].id
                }, function (data) {
                    if (data.response) {
                        if (DEBUG_LEVEL === 1) {
                            print(a[1].fullName, '.progress');
                        } else if (DEBUG_LEVEL === 2) {
                            print('reordered: ' + a[0].fullName + ' -> <b>' + a[1].fullName + '</b> -> end',
                                '.progress');
                        }
                        if (DEBUG_LEVEL >= 1) {
                            print('finished', '.progress');
                        }
                        a.shift();
                    } else {
                        print('error:' + JSON.stringify(data.error), '.progress');
                    }
                });
            } else {
                if (DEBUG_LEVEL == 2) {
                    print('skip: ' + a[1].fullName, '.progress', 'skip');
                }
                if (DEBUG_LEVEL >= 1) {
                    print('finished', '.progress');
                }
                a.shift();
                setTimeout(recSaveSecond, 0);
            }
        }
    }

    VK.api("audio.get",
        {/*count: 10*/},
        function (data) {

            extractList(data.response);
            if (DEBUG_LEVEL == 2) {
                $('body').append('<div class="container old"></div>');
                printList('.old');
            }

            sortList();
            if (DEBUG_LEVEL == 2) {
                $('body').append('<div class="container new"></div>');
                printList('.new');
            }

            $('body').append('<div class="container progress"></div>');
            recSaveSecond();
        });
}
$(document).ready(function () {
    sortAndSave();
});