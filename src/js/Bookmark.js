
const plist = require('simple-plist');
const uuid = require("uuid/v4");
const userHome = require('user-home');

let WebBookmarkType = {
  LIST: "WebBookmarkTypeList",
  PROXY: "WebBookmarkTypeProxy",
  LEAF: "WebBookmarkTypeLeaf"
};

class Bookmark {

  static SAFARI_PLIST_FILE = `${userHome}/Library/Safari/Bookmarks.plist`;
  static CHROME_TO_SAFARI = 'chrome_to_safari';
  static SAFARI_TO_CHROME = 'safari_to_chrome';

  constructor() {
    this.uuid = uuid;
  }

  /**
   *
   * @param {string} safariBookmarks
   */
  loadFromSafari(safariBookmarks=undefined) {

    this.safariRawBookmarks = [];
    if (typeof safariBookmarks === "string") {
      this.safariRawBookmarks.push(plist.parse(safariBookmarks));
    } else if (typeof safariBookmarks === "object") {
      this.safariRawBookmarks.push(safariBookmarks);
    } else if (safariBookmarks === undefined) {
      this.safariRawBookmarks.push(plist.readFileSync(Bookmark.SAFARI_PLIST_FILE));
    }

    this.safariBookmarks = this._fromSafariRe(this.safariRawBookmarks);
  }

  /**
   *
   * @param {function} callback
   * @param {object} chromeBookmarks
   */
  loadFromChrome(callback, chromeBookmarks=undefined) {
    let that = this;
    if (typeof chromeBookmarks === 'string') {
      this.chromeRowBookmarks = JSON.parse(chromeBookmarks);
      this.chromeBookmarks = this._fromChromeRe(this.chromeRowBookmarks);
    } else if (typeof chromeBookmarks === 'object') {
      this.chromeRowBookmarks = chromeBookmarks;
      this.chromeBookmarks = this._fromChromeRe(this.chromeRowBookmarks);
    } else if (chromeBookmarks === undefined) {
      chrome.bookmarks.getTree((results)=>{
        this.chromeRowBookmarks = results;
        this.chromeBookmarks = this._fromChromeRe(this.chromeRowBookmarks);
        callback(that);
      });
    }
  }

  chromeToSafari() {
    let safariNewBookmarks = this._toSafariRe(this.chromeBookmarks);

    safariNewBookmarks = safariNewBookmarks[0].Children[0];
    let root = this.safariRawBookmarks[0];
    safariNewBookmarks.Title = root.Title;
    safariNewBookmarks.Sync = root.Sync;
    safariNewBookmarks.WebBookmarkFileVersion = root.WebBookmarkFileVersion;

    plist.writeFileSync(Bookmark.SAFARI_PLIST_FILE, safariNewBookmarks);
  }

  getSafariBookmark() {
    let safariNewBookmarks = this._toSafariRe(this.chromeBookmarks);

    safariNewBookmarks = safariNewBookmarks[0].Children[0];
    let root = this.safariRawBookmarks[0];
    safariNewBookmarks.Title = root.Title;
    safariNewBookmarks.Sync = root.Sync;
    safariNewBookmarks.WebBookmarkFileVersion = root.WebBookmarkFileVersion;

    return safariNewBookmarks;
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

module.exports = Bookmark;