var _browser = chrome || browser;
var updateList = [];



async function createSubEntries(workFolder, data, depth=2) {
    var index = 0;
    while (found = /^(\s+)<DT><H3.*?>(.*?)<\/H3>\s\1<DL><p>([\s\S]*?)^\1<\/DL><p>/im.exec(data)) {
        data = data.substring(found.index + found[0].length);
        addEntry(workFolder, found[2], found[3], true, depth, index);
        index++;
    }
    while (found = /<DT><A (?:.*?HREF="(.*?)")?.*?>(.*?)<\/.*?>/i.exec(data)) {
        data = data.substring(found.index + found[0].length);
        addEntry(workFolder, found[2], found[1], false, 2, index);
        index++;
    }
}

async function addEntry(destination, name, data=null, recurse, depth=2, index) {
    if (depth < 2) {
        createSubEntries(destination, data, ++depth);
        return;
    }
    name = name.replaceAll('&#39;', "'");
    if (recurse) {
        _browser.bookmarks.create({'parentId': destination, 'title': name, 'index': index}, (subFolder) => {
            updateList.push([subFolder.id, index]);
            createSubEntries(subFolder.id, data);
        });
        return;
    }
    _browser.bookmarks.create({'parentId': destination, 'title': name, 'url': data, 'index': index}, (subFolder) => {
        updateList.push([subFolder.id, index]);
    });
}

function createBookmark(parentId, data) {
    _browser.bookmarks.create({'parentId': parentId, 'title': "Illegal Services"}, (folder) => {
        createSubEntries(folder.id, data, 0);
        setTimeout(() => {
            updateList.forEach((item) => {
                _browser.bookmarks.move(item[0], {'index': item[1]})
            });
        }, 400);
        setTimeout(() => {
            updateList.forEach((item) => {
                _browser.bookmarks.move(item[0], {'index': item[1]})
            });
        }, 500);
    });
}

function refreshBookmarks() {
    fetch("https://raw.githubusercontent.com/Illegal-Services/Illegal_Services/downloads/IS.bookmarks.html")
        .then((response) => {
            return response.text();
        })
        .then(async (data) => {
            _browser.bookmarks.search({"title": "Illegal Services"}, (results) => {
                for (result of results) {
                    _browser.bookmarks.removeTree(result.id);
                };
                // dispatch firefox to search for "toolbar_____"
                if (typeof browser !== "undefined") {
                    createBookmark("toolbar_____", data);
                }
                else
                {
                    createBookmark("1", data);
                }
            });
        })
        .catch(() => {
            console.log("Could not complete the request");
        });
}

_browser.runtime.onStartup.addListener(refreshBookmarks);
_browser.runtime.onInstalled.addListener(refreshBookmarks);