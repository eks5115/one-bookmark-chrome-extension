
let sPlist = require('simple-plist');
const uuid = require("uuid/v4");

const SAFARI_LIST_FILE = '~/Library/Safari/Bookmarks.plist';

let WebBookmarkType = {
  LIST: "WebBookmarkTypeList",
  PROXY: "WebBookmarkTypeProxy",
  LEAF: "WebBookmarkTypeLeaf"
};

class Bookmark {

  constructor() {
    this.uuid = uuid;
  }

  /**
   *
   * @param {string} safariBookmarks
   */
  loadFromSafari(safariBookmarks) {

    this.safariRawBookmarks = [];
    if (typeof safariBookmarks === "string") {
      this.safariRawBookmarks.push(sPlist.parse(safariBookmarks));
    } else if (typeof safariBookmarks === "object") {
      this.safariRawBookmarks.push(safariBookmarks);
    } else if (safariBookmarks === null) {
      this.safariRawBookmarks.push(sPlist.readFileSync(SAFARI_LIST_FILE));
    }

    this.safariBookmarks = this._fromSafariRe(this.safariRawBookmarks);
  }

  loadFromChrome(chromeBookmarks) {
    if (chromeBookmarks === undefined) {
      chrome.bookmarks.getTree(function(bookmarkArray){
        this.chromeRowBookmarks = bookmarkArray
      })
    } else {
      this.chromeRowBookmarks = chromeBookmarks
    }

    this.chromeBookmarks = this._fromChromeRe(this.chromeRowBookmarks);
  }

  chromeToSafari() {
    let safariNewBookmarks = this._toSafariRe(this.chromeBookmarks);

    safariNewBookmarks = safariNewBookmarks[0].Children[0];
    let root = this.safariRawBookmarks[0];
    safariNewBookmarks.Title = root.Title;
    safariNewBookmarks.Sync = root.Sync;
    safariNewBookmarks.WebBookmarkFileVersion = root.WebBookmarkFileVersion;

    sPlist.writeFileSync(SAFARI_LIST_FILE, safariNewBookmarks);
  }

  /**
   *
   * @param {Array} datas
   */
  _fromSafariRe(datas) {
    let array = [];

    datas.forEach(item => {
      let object = {};

      if (item.Title === undefined) {

        object.title = item.URIDictionary.title;
        object.url = item.URLString;
        array.push(object);
      } else {
        object.title = item.Title;
        if (item.Children !== undefined) {
          object.children = [];
          object.children = object.children.concat(this._fromSafariRe(item.Children));
        }
        array.push(object);
      }
    });

    return array;
  }

  _toSafariRe(datas) {

    let that = this;
    let array = [];

    datas.forEach(item => {
      /** @type string **/
      let uuid = that.uuid();
      uuid = uuid.toUpperCase();
      let object = {
        WebBookmarkUUID: uuid
      };

      if (item.url === undefined) {
        object.WebBookmarkType = WebBookmarkType.LIST;
      } else {
        object.WebBookmarkType = WebBookmarkType.LEAF;
      }

      if (item.title === "History") {
        object.WebBookmarkType = WebBookmarkType.PROXY;
        object.WebBookmarkIdentifier = "History";
      }

      if (item.title === "com.apple.ReadingList") {
        object.ShouldOmitFromUI = true;
      }

      if (item.children === undefined) {
        if (item.url !== undefined) {
          object.URIDictionary = {};
          object.URIDictionary.title = item.title;
          object.URLString = item.url;
          object.ReadingListNonSync = {};
          object.ReadingListNonSync.neverFetchMetadata = false;
        }
        array.push(object);
      } else {
        object.Title = item.title;
        object.Children = [];
        object.Children = object.Children.concat(this._toSafariRe(item.children));
        array.push(object);
      }
    });

    return array;
  }

  _fromChromeRe(datas) {
    let array = [];

    datas.forEach(item => {
      let object = {};
      object.title = item.title;
      if (item.children === undefined) {
        if (item.url !== undefined) {
          object.url = item.url;
        }
        array.push(object);
      } else {
        object.children = [];
        object.children = object.children.concat(this._fromChromeRe(item.children));
        array.push(object);
      }
    });

    return array;
  }
}

export default Bookmark;
