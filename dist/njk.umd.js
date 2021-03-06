(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.NJK = factory());
}(this, function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /**
   * Sentry v1.0.3 前端日志监控封装
   * @authors wangjun3 (wangjun3@eastmoney.com)
   * @date    2020-05-22 10:08:50
   */
  // Sentry start
  var SentryCenter = {
    /**
        * 日志SDK加载方法
        * @param {string} dsn 项目配置地址
        * @param {string} environment 设置日志环境，默认Prod，Dev/Test/Prod
        * @param {function} callback 回调函数
        * @param {boolean} debug 是否开启调试模式 默认false
        */
    loadSDK: function loadSDK(dsn, environment, callback, debug) {
      try {
        if (!this.isLowIE(9)) {
          var SentrySdk = document.createElement('script');
          SentrySdk.src = 'https://premiumcdn.eastmoney.com/common/js/sentry/sentry.5.15.4.min.js';
          SentrySdk.defer = true;

          SentrySdk.onload = function () {
            SentryCenter.initSentry(dsn, environment, callback, debug);
          };

          document.head.appendChild(SentrySdk);
        }
      } catch (e) {
        console.log(e);
      }
    },

    /**
     * 日志初始化
     * @param {string} dsn 项目配置地址
     * @param {string} environment 设置日志环境，默认Prod，Dev/Test/Prod
     * @param {function} callback 回调函数
     * @param {boolean} debug 是否开启调试模式 默认false
     */
    initSentry: function initSentry(dsn, environment, callback, debug) {
      try {
        if (SentryCenter.isLowIE(9)) {
          return false;
        } // 针对动态引入sdk 做检测，避免因动态引入抛错


        if (!window.Sentry) {
          SentryCenter.loadSDK(dsn, environment, callback, debug);
          return false;
        }

        Sentry.init({
          dsn: dsn,
          environment: environment || 'Prod',
          debug: debug || false,
          beforeSend: function beforeSend(event) {
            // 发送日志前处理函数
            if (typeof window.SentrybeforeSend == 'function') {
              window.SentrybeforeSend(event);
            }

            return event;
          }
        });
        callback && typeof callback == 'function' ? window.SentrybeforeSend = callback : '';
      } catch (e) {
        console.log(e);
      }
    },

    /**
     * 设置日志基础信息
    *  @param {array} tags 设置全局事件标签 [{key: '', value: ''}]
    *  @param {Object} user 设置全局用户标签
     */
    setSentry: function setSentry(tags, user) {
      try {
        tag = tag || [];
        Sentry.configureScope(function (scope) {
          if (Array.isArray(tags) && tags.length) {
            // 事件标签
            for (var i = 0; i < tags.length; i++) {
              scope.setTag(tags[i].key, tag[i].value);
            }
          } // 用户信息


          user ? scope.setUser(user) : '';
        });
      } catch (e) {}
    },

    /**
     * 发送错误日志信息
     * @param {string} title 传递信息标题 必传
     * @param {string|Object} extra 日志主体内容 必传 可为空
     * @param {Object} config 配置字段  必传 可为空
     * @param {array} finger 事件分组 可选  
     * @param {Object} user 设置用户标签 可选  
     * @param {function} callback 回调函数 可选 
     */
    sendError: function sendError(title, extra, config) {
      try {
        config = config || {};
        Sentry.withScope(function (scope) {
          config.finger ? scope.setFingerprint(config.finger) : '';
          config.user ? scope.setUser(config.user) : '';
          scope.setExtra('remark', extra || '');
          Sentry.captureException(new Error(title));
        });
      } catch (e) {
        console.log(e);
      }
    },

    /**
     * 发送日志信息
     * @param {object} config 日志主体内容
     * @param {string} title 传递信息标题 必传
     * @param {string|Object} extra 日志主体内容 可选 
     * @param {string} level 事件的严重性 可选 
     *                           设置为五个值之一：fatal，error，warning，info，和debug
     *                           error是默认值，fatal是最严重的，debug是最不严重的。
     * @param {array} finger 事件分组 可选 
     * @param {Object} user 设置用户标签 可选 
     * @param {function} callback 回调函数 可选 
     */
    sendMessage: function sendMessage(config) {
      try {
        config.level = config.level || '';
        Sentry.withScope(function (scope) {
          config.finger ? scope.setFingerprint(config.finger) : '';
          config.user ? scope.setUser(config.user) : '';
          scope.setExtra('remark', config.extra || '');
          Sentry.captureMessage(config.title, config.level);
        });
      } catch (e) {}
    },

    /**
     * 显示用户反馈
     * @param {string} eventId 日志事件ID 可选 默认读取上一次事件ID
     * 如需定制弹窗 可自行调用Sentry.showReportDialog调整相应参数使用
     */
    showUserReport: function showUserReport(eventId) {
      try {
        Sentry.showReportDialog({
          eventId: eventId || '',
          title: '用户反馈收集',
          lang: 'zh',
          subtitle: '',
          subtitle2: '',
          labelName: '姓名',
          labelEmail: '邮箱',
          labelComments: '反馈内容',
          labelClose: '关闭',
          labelSubmit: '提交',
          errorGeneric: '网络异常，请重试！',
          errorFormEntry: '为了更好地帮助您解决问题，请正确填写反馈内容。',
          successMessage: '您的反馈已发送。谢谢！'
        });
      } catch (e) {}
    },
    isLowIE: function isLowIE(base) {
      base = +(base || 8);

      if (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) < base) {
        return true;
      }

      return false;
    }
  };

  var _arguments = arguments;

  /**
   * 邮箱
   * @param {*} s
   */
  var isEmail = function isEmail(s) {
    return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s);
  };
  /**
   * 手机号码
   * @param {*} s
   */

  var isMobile = function isMobile(s) {
    return /^1[0-9]{10}$/.test(s);
  };
  /**
   * 电话号码
   * @param {*} s
   */

  var isPhone = function isPhone(s) {
    return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s);
  };
  /**
   * URL地址
   * @param {*} s
   */

  var isURL = function isURL(s) {
    return /^http[s]?:\/\/.*/.test(s);
  };
  /**
   * 是否字符串
   */

  var isString = function isString(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'String';
  };
  /**
   * 是否数字
   */

  var isNumber = function isNumber(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Number';
  };
  /**
   * 是否boolean
   */

  var isBoolean = function isBoolean(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean';
  };
  /**
   * 是否函数
   */

  var isFunction = function isFunction(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Function';
  };
  /**
   * 是否为null
   */

  var isNull = function isNull(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Null';
  };
  /**
   * 是否undefined
   */

  var isUndefined = function isUndefined(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined';
  };
  /**
   * 是否对象
   */

  var isObj = function isObj(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Object';
  };
  /**
   * /是否数组
   */

  var isArray = function isArray(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Array';
  };
  /**
   * 是否时间
   */

  var isDate = function isDate(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Date';
  };
  /**
   * 是否正则
   */

  var isRegExp = function isRegExp(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'RegExp';
  };
  /**
   * 是否错误对象
   */

  var isError = function isError(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Error';
  };
  /**
   * 是否Symbol函数
   */

  var isSymbol = function isSymbol(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Symbol';
  };
  /**
   * 是否Promise对象
   */

  var isPromise = function isPromise(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Promise';
  };
  /**
   * 是否Set对象
   */

  var isSet = function isSet(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Set';
  };
  var ua = navigator.userAgent.toLowerCase();
  /**
   * 是否是微信浏览器
   */

  var isWeiXin = function isWeiXin() {
    return ua.match(/microMessenger/i) == 'micromessenger';
  };
  /**
   * 是否是移动端
   */

  var isDeviceMobile = function isDeviceMobile() {
    return /android|webos|iphone|ipod|balckberry/i.test(ua);
  };
  /**
   * 是否是QQ浏览器
   */

  var isQQBrowser = function isQQBrowser() {
    return !!ua.match(/mqqbrowser|qzone|qqbrowser|qbwebviewtype/i);
  };
  /**
   * 是否是爬虫
   */

  var isSpider = function isSpider() {
    return /adsbot|googlebot|bingbot|msnbot|yandexbot|baidubot|robot|careerbot|seznambot|bot|baiduspider|jikespider|symantecspider|scannerlwebcrawler|crawler|360spider|sosospider|sogou web sprider|sogou orion spider/.test(ua);
  };
  /**
   * 是否ios
   */

  var isIos = function isIos() {
    var u = navigator.userAgent;

    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
      //安卓手机
      return false;
    } else if (u.indexOf('iPhone') > -1) {
      //苹果手机
      return true;
    } else if (u.indexOf('iPad') > -1) {
      //iPad
      return false;
    } else if (u.indexOf('Windows Phone') > -1) {
      //winphone手机
      return false;
    } else {
      return false;
    }
  };
  /**
   * 是否为PC端
   */

  var isPC = function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;

    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }

    return flag;
  };
  /**
   * 去除html标签
   * @param {*} str 
   */

  var removeHtmltag = function removeHtmltag(str) {
    return str.replace(/<[^>]+>/g, '');
  };
  /**
   * 获取url参数
   * @param {*} name 
   */

  var getQueryString = function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var search = window.location.search.split('?')[1] || '';
    var r = search.match(reg) || [];
    return r[2];
  };
  /**
   * 动态引入js
   * @param {*} src 
   */

  var injectScript = function injectScript(src) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = src;
    var t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
  };
  /**
   * 根据url地址下载
   * @param {*} url 
   */

  var download = function download(url) {
    var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    var isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

    if (isChrome || isSafari) {
      var link = document.createElement('a');
      link.href = url;

      if (link.download !== undefined) {
        var fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
        link.download = fileName;
      }

      if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
      }
    }

    if (url.indexOf('?') === -1) {
      url += '?download';
    }

    window.open(url, '_self');
    return true;
  };
  /**
   * el是否包含某个class
   * @param {*} el 
   * @param {*} className 
   */

  var hasClass = function hasClass(el, className) {
    var reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return reg.test(el.className);
  };
  /**
   * el添加某个class
   * @param {*} el 
   * @param {*} className 
   */

  var addClass = function addClass(el, className) {
    if (hasClass(el, className)) {
      return;
    }

    var newClass = el.className.split(' ');
    newClass.push(className);
    el.className = newClass.join(' ');
  };
  /**
   * el去除某个class
   * @param {*} el 
   * @param {*} className 
   */

  var removeClass = function removeClass(el, className) {
    if (!hasClass(el, className)) {
      return;
    }

    var reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
    el.className = el.className.replace(reg, ' ');
  };
  /**
   * 获取滚动的坐标
   * @param {*} el 
   */

  var getScrollPosition = function getScrollPosition() {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
    return {
      x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
      y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
    };
  };
  /**
   * 滚动到顶部
   */

  var scrollToTop = function scrollToTop() {
    var c = document.documentElement.scrollTop || document.body.scrollTop;

    if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      window.scrollTo(0, c - c / 8);
    }
  };
  /**
   * el是否在视口范围内
   * @param {*} el 
   * @param {*} partiallyVisible 
   */

  var elementIsVisibleInViewport = function elementIsVisibleInViewport(el) {
    var partiallyVisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var _el$getBoundingClient = el.getBoundingClientRect(),
        top = _el$getBoundingClient.top,
        left = _el$getBoundingClient.left,
        bottom = _el$getBoundingClient.bottom,
        right = _el$getBoundingClient.right;

    var _window = window,
        innerHeight = _window.innerHeight,
        innerWidth = _window.innerWidth;
    return partiallyVisible ? (top > 0 && top < innerHeight || bottom > 0 && bottom < innerHeight) && (left > 0 && left < innerWidth || right > 0 && right < innerWidth) : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  };
  /**
   * 洗牌算法随机
   * @param {*} arr 
   */

  var shuffle = function shuffle(arr) {
    var result = [],
        random;

    while (arr.length > 0) {
      random = Math.floor(Math.random() * arr.length);
      result.push(arr[random]);
      arr.splice(random, 1);
    }

    return result;
  };
  /**
   * 劫持粘贴板
   * @param {*} value 
   */

  var copyTextToClipboard = function copyTextToClipboard(value) {
    var textArea = document.createElement("textarea");
    textArea.style.background = 'transparent';
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      var successful = document.execCommand('copy');
    } catch (err) {
      console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
  };
  /**
   * 判断类型集合
   * @param {*} str 
   * @param {*} type 
   */

  var checkStr = function checkStr(str, type) {
    switch (type) {
      case 'phone':
        //手机号码
        return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(str);

      case 'tel':
        //座机
        return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);

      case 'card':
        //身份证
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str);

      case 'pwd':
        //密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线
        return /^[a-zA-Z]\w{5,17}$/.test(str);

      case 'postal':
        //邮政编码
        return /[1-9]\d{5}(?!\d)/.test(str);

      case 'QQ':
        //QQ号
        return /^[1-9][0-9]{4,9}$/.test(str);

      case 'email':
        //邮箱
        return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);

      case 'money':
        //金额(小数点2位)
        return /^\d*(?:\.\d{0,2})?$/.test(str);

      case 'URL':
        //网址
        return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(str);

      case 'IP':
        //IP
        return /((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))/.test(str);

      case 'date':
        //日期时间
        return /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})(?:\:\d{2}|:(\d{2}):(\d{2}))$/.test(str) || /^(\d{4})\-(\d{2})\-(\d{2})$/.test(str);

      case 'number':
        //数字
        return /^[0-9]$/.test(str);

      case 'english':
        //英文
        return /^[a-zA-Z]+$/.test(str);

      case 'chinese':
        //中文
        return /^[\\u4E00-\\u9FA5]+$/.test(str);

      case 'lower':
        //小写
        return /^[a-z]+$/.test(str);

      case 'upper':
        //大写
        return /^[A-Z]+$/.test(str);

      case 'HTML':
        //HTML标记
        return /<("[^"]*"|'[^']*'|[^'">])*>/.test(str);

      default:
        return true;
    }
  };
  /**
   * 严格的身份证校验
   * @param {*} sId 
   */

  var isCardID = function isCardID(sId) {
    if (!/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(sId)) {
      console.log('你输入的身份证长度或格式错误');
      return false;
    } //身份证城市


    var aCity = {
      11: "北京",
      12: "天津",
      13: "河北",
      14: "山西",
      15: "内蒙古",
      21: "辽宁",
      22: "吉林",
      23: "黑龙江",
      31: "上海",
      32: "江苏",
      33: "浙江",
      34: "安徽",
      35: "福建",
      36: "江西",
      37: "山东",
      41: "河南",
      42: "湖北",
      43: "湖南",
      44: "广东",
      45: "广西",
      46: "海南",
      50: "重庆",
      51: "四川",
      52: "贵州",
      53: "云南",
      54: "西藏",
      61: "陕西",
      62: "甘肃",
      63: "青海",
      64: "宁夏",
      65: "新疆",
      71: "台湾",
      81: "香港",
      82: "澳门",
      91: "国外"
    };

    if (!aCity[parseInt(sId.substr(0, 2))]) {
      console.log('你的身份证地区非法');
      return false;
    } // 出生日期验证


    var sBirthday = (sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2))).replace(/-/g, "/"),
        d = new Date(sBirthday);

    if (sBirthday != d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()) {
      console.log('身份证上的出生日期非法');
      return false;
    } // 身份证号码校验


    var sum = 0,
        weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
        codes = "10X98765432";

    for (var i = 0; i < sId.length - 1; i++) {
      sum += sId[i] * weights[i];
    }

    var last = codes[sum % 11]; //计算出来的最后一位身份证号码

    if (sId[sId.length - 1] != last) {
      console.log('你输入的身份证号非法');
      return false;
    }

    return true;
  };
  /********************************************* 数字转换 ******************************/

  /**
   * 随机数范围
   */

  var random = function random(min, max) {
    if (_arguments.length === 2) {
      return Math.floor(min + Math.random() * (max + 1 - min));
    } else {
      return null;
    }
  };
  /**
   * 将阿拉伯数字翻译成中文的大写数字
   */

  var numberToChinese = function numberToChinese(num) {
    var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十");
    var BB = new Array("", "十", "百", "仟", "萬", "億", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."),
        k = 0,
        re = "";

    for (var i = a[0].length - 1; i >= 0; i--) {
      switch (k) {
        case 0:
          re = BB[7] + re;
          break;

        case 4:
          if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$").test(a[0])) re = BB[4] + re;
          break;

        case 8:
          re = BB[5] + re;
          BB[7] = BB[5];
          k = 0;
          break;
      }

      if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
      if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
      k++;
    }

    if (a.length > 1) // 加上小数部分(如果有小数部分)
      {
        re += BB[6];

        for (var i = 0; i < a[1].length; i++) {
          re += AA[a[1].charAt(i)];
        }
      }

    if (re == '一十') re = "十";
    if (re.match(/^一/) && re.length == 3) re = re.replace("一", "");
    return re;
  };
  /**
   * 将数字转换为大写金额
   */

  var changeToChinese = function changeToChinese(Num) {
    //判断如果传递进来的不是字符的话转换为字符
    if (typeof Num == "number") {
      Num = new String(Num);
    }
    Num = Num.replace(/,/g, ""); //替换tomoney()中的“,”

    Num = Num.replace(/ /g, ""); //替换tomoney()中的空格

    Num = Num.replace(/￥/g, ""); //替换掉可能出现的￥字符

    if (isNaN(Num)) {
      //验证输入的字符是否为数字
      //alert("请检查小写金额是否正确");
      return "";
    }

    var part = String(Num).split(".");
    var newchar = ""; //小数点前进行转化

    for (var i = part[0].length - 1; i >= 0; i--) {
      if (part[0].length > 10) {
        return ""; //若数量超过拾亿单位，提示
      }

      var tmpnewchar = "";
      var perchar = part[0].charAt(i);

      switch (perchar) {
        case "0":
          tmpnewchar = "零" + tmpnewchar;
          break;

        case "1":
          tmpnewchar = "壹" + tmpnewchar;
          break;

        case "2":
          tmpnewchar = "贰" + tmpnewchar;
          break;

        case "3":
          tmpnewchar = "叁" + tmpnewchar;
          break;

        case "4":
          tmpnewchar = "肆" + tmpnewchar;
          break;

        case "5":
          tmpnewchar = "伍" + tmpnewchar;
          break;

        case "6":
          tmpnewchar = "陆" + tmpnewchar;
          break;

        case "7":
          tmpnewchar = "柒" + tmpnewchar;
          break;

        case "8":
          tmpnewchar = "捌" + tmpnewchar;
          break;

        case "9":
          tmpnewchar = "玖" + tmpnewchar;
          break;
      }

      switch (part[0].length - i - 1) {
        case 0:
          tmpnewchar = tmpnewchar + "元";
          break;

        case 1:
          if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
          break;

        case 2:
          if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
          break;

        case 3:
          if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
          break;

        case 4:
          tmpnewchar = tmpnewchar + "万";
          break;

        case 5:
          if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
          break;

        case 6:
          if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
          break;

        case 7:
          if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
          break;

        case 8:
          tmpnewchar = tmpnewchar + "亿";
          break;

        case 9:
          tmpnewchar = tmpnewchar + "拾";
          break;
      }

      var newchar = tmpnewchar + newchar;
    } //小数点之后进行转化


    if (Num.indexOf(".") != -1) {
      if (part[1].length > 2) {
        // alert("小数点之后只能保留两位,系统将自动截断");
        part[1] = part[1].substr(0, 2);
      }

      for (i = 0; i < part[1].length; i++) {
        tmpnewchar = "";
        perchar = part[1].charAt(i);

        switch (perchar) {
          case "0":
            tmpnewchar = "零" + tmpnewchar;
            break;

          case "1":
            tmpnewchar = "壹" + tmpnewchar;
            break;

          case "2":
            tmpnewchar = "贰" + tmpnewchar;
            break;

          case "3":
            tmpnewchar = "叁" + tmpnewchar;
            break;

          case "4":
            tmpnewchar = "肆" + tmpnewchar;
            break;

          case "5":
            tmpnewchar = "伍" + tmpnewchar;
            break;

          case "6":
            tmpnewchar = "陆" + tmpnewchar;
            break;

          case "7":
            tmpnewchar = "柒" + tmpnewchar;
            break;

          case "8":
            tmpnewchar = "捌" + tmpnewchar;
            break;

          case "9":
            tmpnewchar = "玖" + tmpnewchar;
            break;
        }

        if (i == 0) tmpnewchar = tmpnewchar + "角";
        if (i == 1) tmpnewchar = tmpnewchar + "分";
        newchar = newchar + tmpnewchar;
      }
    } //替换所有无用汉字


    while (newchar.search("零零") != -1) {
      newchar = newchar.replace("零零", "零");
    }

    newchar = newchar.replace("零亿", "亿");
    newchar = newchar.replace("亿万", "亿");
    newchar = newchar.replace("零万", "万");
    newchar = newchar.replace("零元", "元");
    newchar = newchar.replace("零角", "");
    newchar = newchar.replace("零分", "");

    if (newchar.charAt(newchar.length - 1) == "元") {
      newchar = newchar + "整";
    }

    return newchar;
  };
  /********************************************* 关于数组 ******************************/

  /**
   * 判断一个元素是否在数组中
   */

  var contains = function contains(arr, val) {
    return arr.indexOf(val) != -1 ? true : false;
  };
  /**
   * @param  {arr} 数组
   * @param  {fn} 回调函数
   * @return {undefined}
   */

  var each = function each(arr, fn) {
    fn = fn || Function;
    var args = Array.prototype.slice.call(_arguments, 1);

    for (var i = 0; i < arr.length; i++) {
      var res = fn.apply(arr, [arr[i], i].concat(args));
    }
  };
  /**
   * @param  {arr} 数组
   * @param  {type} 1：从小到大   2：从大到小   3：随机
   * @return {Array}
   */

  var sort = function sort(arr) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return arr.sort(function (a, b) {
      switch (type) {
        case 1:
          return a - b;

        case 2:
          return b - a;

        case 3:
          return Math.random() - 0.5;

        default:
          return arr;
      }
    });
  };
  /**
   * 去重
   */

  var unique = function unique(arr) {
    if (Array.hasOwnProperty('from')) {
      return Array.from(new Set(arr));
    } else {
      var n = {},
          r = [];

      for (var i = 0; i < arr.length; i++) {
        if (!n[arr[i]]) {
          n[arr[i]] = true;
          r.push(arr[i]);
        }
      }

      return r;
    }
  };
  /**
   * 求两个集合的并集
   */

  var union = function union(a, b) {
    var newArr = a.concat(b);
    return unique(newArr);
  };
  /**
   * 删除其中一个元素
   */

  var remove = function remove(arr, ele) {
    var index = arr.indexOf(ele);

    if (index > -1) {
      arr.splice(index, 1);
    }

    return arr;
  };
  /**
   * 将类数组转换为数组的方法
   */

  var formArray = function formArray(ary) {
    var arr = [];

    if (Array.isArray(ary)) {
      arr = ary;
    } else {
      arr = Array.prototype.slice.call(ary);
    }
    return arr;
  };
  /**
   * 最大值
   */

  var max = function max(arr) {
    return Math.max.apply(null, arr);
  };
  /**
   * 最小值
   */

  var min = function min(arr) {
    return Math.min.apply(null, arr);
  };
  /**
   * 求和
   */

  var sum = function sum(arr) {
    return arr.reduce(function (pre, cur) {
      return pre + cur;
    });
  };
  /**
   * 平均值
   */

  var average = function average(arr) {
    return sum(arr) / arr.length;
  };
  /********************************************* String 字符串操作 ******************************/

  /**
   * 去除空格
   * @param  {str}
   * @param  {type} 
   * type:  1-所有空格  2-前后空格  3-前空格 4-后空格
   * @return {String}
   */

  var trim = function trim(str, type) {
    type = type || 1;

    switch (type) {
      case 1:
        return str.replace(/\s+/g, "");

      case 2:
        return str.replace(/(^\s*)|(\s*$)/g, "");

      case 3:
        return str.replace(/(^\s*)/g, "");

      case 4:
        return str.replace(/(\s*$)/g, "");

      default:
        return str;
    }
  };
  /**
   * @param  {str} 
   * @param  {type}
   *       type:  1:首字母大写  2：首字母小写  3：大小写转换  4：全部大写  5：全部小写
   * @return {String}
   */

  var changeCase = function changeCase(str, type) {
    type = type || 4;

    switch (type) {
      case 1:
        return str.replace(/\b\w+\b/g, function (word) {
          return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
        });

      case 2:
        return str.replace(/\b\w+\b/g, function (word) {
          return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase();
        });

      case 3:
        return str.split('').map(function (word) {
          if (/[a-z]/.test(word)) {
            return word.toUpperCase();
          } else {
            return word.toLowerCase();
          }
        }).join('');

      case 4:
        return str.toUpperCase();

      case 5:
        return str.toLowerCase();

      default:
        return str;
    }
  };
  /*
  *  检测密码强度
  */

  var checkPwd = function checkPwd(str) {
    var Lv = 0;

    if (str.length < 6) {
      return Lv;
    }

    if (/[0-9]/.test(str)) {
      Lv++;
    }

    if (/[a-z]/.test(str)) {
      Lv++;
    }

    if (/[A-Z]/.test(str)) {
      Lv++;
    }

    if (/[\.|-|_]/.test(str)) {
      Lv++;
    }

    return Lv;
  };
  /**
   * 函数节流器
   * @param  {Function} fn 需要执行性的函数
   * @param  {number} time 时间戳
   * @param  {number} interval 间隔时间
   */

  var debouncer = function debouncer(fn, time) {
    var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

    if (time - (window.debounceTimestamp || 0) > interval) {
      fn && fn();
      window.debounceTimestamp = time;
    }
  };
  /**
   * 在字符串中插入新字符串
   * @param {string} soure 源字符
   * @param {string} index 插入字符的位置
   * @param {string} newStr 需要插入的字符
   * @returns {string} 返回新生成的字符
   */

  var insertStr = function insertStr(soure, index, newStr) {
    var str = soure.slice(0, index) + newStr + soure.slice(index);
    return str;
  };
  /**
  * 判断两个对象是否键值相同
  * @param  {Object}  a 第一个对象
  * @param  {Object}  b 第一个对象
  * @return {Boolean}   相同返回true，否则返回false
  */

  var isObjectEqual = function isObjectEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    return true;
  };
  /**
   * 16进制颜色转RGB\RGBA字符串
   * @param  {String} val 16进制颜色值
   * @param  {Number} opa 不透明度，取值0~1
   * @return {String}     转换后的RGB或RGBA颜色值
   */

  var colorToRGB = function colorToRGB(val, opa) {
    var pattern = /^(#?)[a-fA-F0-9]{6}$/; //16进制颜色值校验规则

    var isOpa = typeof opa == 'number'; //判断是否有设置不透明度

    if (!pattern.test(val)) {
      //如果值不符合规则返回空字符
      return '';
    }

    var v = val.replace(/#/, ''); //如果有#号先去除#号

    var rgbArr = [];
    var rgbStr = '';

    for (var i = 0; i < 3; i++) {
      var item = v.substring(i * 2, i * 2 + 2);
      var num = parseInt(item, 16);
      rgbArr.push(num);
    }

    rgbStr = rgbArr.join();
    rgbStr = 'rgb' + (isOpa ? 'a' : '') + '(' + rgbStr + (isOpa ? ',' + opa : '') + ')';
    return rgbStr;
  };
  /**
   * 追加url参数
   * @param {string} url url参数
   * @param {string|object} key 名字或者对象
   * @param {string} value 值
   * @return {string} 返回新的url
   * @example
   * appendQuery('lechebang.com', 'id', 3);
   * appendQuery('lechebang.com?key=value', { cityId: 2, cityName: '北京'});
   */

  var appendQuery = function appendQuery(url, key, value) {
    var options = key;

    if (typeof options == 'string') {
      options = {};
      options[key] = value;
    }

    options = $.param(options);

    if (url.includes('?')) {
      url += '&' + options;
    } else {
      url += '?' + options;
    }

    return url;
  };
  /**
   * 判断a数组是否包含b数组中
   */

  var getArrRepeat = function getArrRepeat(arr1, arr2) {
    return arr1.filter(function (item, index) {
      return arr2.includes(item);
    });
  };
  /**
   * 将数组分片
   * 列子[1,2,3,4,5,6,7,8] [[1,2,3],[4,5,6],[7,8]]
   */

  var arrChunk = function arrChunk() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var result = [];

    for (var i = 0, len = data.length; i < len; i += space) {
      result.push(data.slice(i, i + space));
    }

    return {
      data: result,
      total: data.length,
      space: space
    };
  };
  /**
   * 复制内容
   */

  var copyToClip = function copyToClip(content) {
    var aux = document.createElement("input");
    aux.setAttribute("value", content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    console.log('复制成功');
  };
  /**
   * 生成uuid
   */

  var generateUUID = function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : r & 0x7 | 0x8).toString(16);
    });
    return uuid;
  };

  var util = /*#__PURE__*/Object.freeze({
    isEmail: isEmail,
    isMobile: isMobile,
    isPhone: isPhone,
    isURL: isURL,
    isString: isString,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isNull: isNull,
    isUndefined: isUndefined,
    isObj: isObj,
    isArray: isArray,
    isDate: isDate,
    isRegExp: isRegExp,
    isError: isError,
    isSymbol: isSymbol,
    isPromise: isPromise,
    isSet: isSet,
    ua: ua,
    isWeiXin: isWeiXin,
    isDeviceMobile: isDeviceMobile,
    isQQBrowser: isQQBrowser,
    isSpider: isSpider,
    isIos: isIos,
    isPC: isPC,
    removeHtmltag: removeHtmltag,
    getQueryString: getQueryString,
    injectScript: injectScript,
    download: download,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    getScrollPosition: getScrollPosition,
    scrollToTop: scrollToTop,
    elementIsVisibleInViewport: elementIsVisibleInViewport,
    shuffle: shuffle,
    copyTextToClipboard: copyTextToClipboard,
    checkStr: checkStr,
    isCardID: isCardID,
    random: random,
    numberToChinese: numberToChinese,
    changeToChinese: changeToChinese,
    contains: contains,
    each: each,
    sort: sort,
    unique: unique,
    union: union,
    remove: remove,
    formArray: formArray,
    max: max,
    min: min,
    sum: sum,
    average: average,
    trim: trim,
    changeCase: changeCase,
    checkPwd: checkPwd,
    debouncer: debouncer,
    insertStr: insertStr,
    isObjectEqual: isObjectEqual,
    colorToRGB: colorToRGB,
    appendQuery: appendQuery,
    getArrRepeat: getArrRepeat,
    arrChunk: arrChunk,
    copyToClip: copyToClip,
    generateUUID: generateUUID
  });

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var mku_min = createCommonjsModule(function (module, exports) {
  !function(e,n){n(exports);}(commonjsGlobal,function(e){window.__env__=navigator&&navigator.userAgent+";"||"";function o(t){r.inApp(function(){var e=t.data&&JSON.stringify(t.data)||"";r.isAndroid?prompt(t.af,e):r.isIOS&&(window.location.href="".concat(t.if+":"+e));},t.noin),r.inTTJJ(function(){var e=t.data&&JSON.stringify(t.data)||"",n=e?"(".concat(e,")"):"";r.isAndroid?window.location.href="".concat(t.af).concat(n):r.isIOS&&(window.location.href="".concat(t.if).concat(n));},t.nointtjj);}var n,t,i,a,r=(n=__env__.match(/pkg=(.*?);/),t=__env__.match(/color=(.*?);/),i=__env__.match(/appver=(.*?);/),{inApp:function(e,n){!/eastmoney/.test(__env__.replace("eastmoney_",""))||/eastmoney.marketingapp/gi.test(__env__)?n&&n():e&&e();},inTTJJ:function(e,n){/ttjj/.test(__env__.replace("TTJJ","ttjj"))?e&&e():n&&n();},isTTJJ:/ttjj/.test(__env__.replace("TTJJ","ttjj")),isQQ:/QQ\//.test(__env__),isIOS:/iPhone|iPad/.test(__env__),isAndroid:/Android/.test(__env__),isWeChat:/MicroMessenger/.test(__env__),pkg:n&&n[1]||"",color:t&&t[1]||"",version:i&&i[1]||""}),c=(a=window.location.origin,/marketing.dfcfs.com/gi.test(a)||/marketing.eastmoney.com/gi.test(a)||/marketinghd.eastmoney.com/gi.test(a)||/marketing.18.cn/gi.test(a)||/marketinghd.dfcfs.com/gi.test(a)||/marketing.dfcfs.cn/gi.test(a)||/marketinghd.dfcfs.cn/gi.test(a)?"prod":"cs");console.log("pageEnv",c);var p=function(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e};function s(n,e){var t,i=Object.keys(n);return Object.getOwnPropertySymbols&&(t=Object.getOwnPropertySymbols(n),e&&(t=t.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),i.push.apply(i,t)),i}function d(e,n){var t=document.getElementsByTagName("head")[0],i=document.createElement("script");i.setAttribute("type","text/javascript"),i.setAttribute("src",e),t.appendChild(i),i.onload=function(){n&&n();};}function f(n,e){var t,i=Object.keys(n);return Object.getOwnPropertySymbols&&(t=Object.getOwnPropertySymbols(n),e&&(t=t.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),i.push.apply(i,t)),i}function l(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?f(Object(t),!0).forEach(function(e){p(n,e,t[e]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):f(Object(t)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e));});}return n}function u(e,n){window.cb_appinfo=function(e){n&&n(e);},o({data:{callbackname:"cb_appinfo",type:e},if:"h5GetModuleInfo",af:"h5GetModuleInfo"});}function m(e){var n,t;return 0<document.cookie.length&&-1!=(n=document.cookie.indexOf(e+"="))?(n=n+e.length+1,-1==(t=document.cookie.indexOf(";",n))&&(t=document.cookie.length),unescape(document.cookie.substring(n,t))):""}function w(n,e){var t,i=Object.keys(n);return Object.getOwnPropertySymbols&&(t=Object.getOwnPropertySymbols(n),e&&(t=t.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),i.push.apply(i,t)),i}function g(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?w(Object(t),!0).forEach(function(e){p(n,e,t[e]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):w(Object(t)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e));});}return n}function h(e){r.isAndroid?window.location.href="dfcft://webh5?isAd=1&url="+e:r.isIOS&&(window.location.href="eastmoney://page/opensafari?url="+e);}e.AppToast=function(e){var n={msg:e};r.inApp(function(){if(r.isIOS)try{eastmoney.emToast(JSON.stringify(n));}catch(e){}else"undefined"!=window.__EM.prompt?window.__EM.prompt("emToast",JSON.stringify(n)):prompt("emToast",JSON.stringify(n));});},e.EMpushNotification=function(n){window.__callback_EMpushNotification=function(e){n(e);};var e={moduleName:"PushNotification",methodName:"checkPermissions",callbackName:"__callback_EMpushNotification",requestJson:"{}"};r.inApp(function(){r.isIOS?window.location="callHybridMethod:"+JSON.stringify(e):"undefined"!=window.__EM.prompt?window.__EM.prompt("callHybridMethod",JSON.stringify(e)):prompt("callHybridMethod",JSON.stringify(e));},function(){"function"==typeof n&&n({code:404,msg:"不在东财app内"});});},e.__=function(e,n){var t=n.split(".")||[],i=null;if(!e)return i;for(var o=e,a=0;a<t.length;a++){if(!o.hasOwnProperty(t[a])){i=null;break}i=o=o[t[a]];}return i},e.appConfirm=function(e){window.__callback_emH5toNativeAlterView_confirm__=function(){"function"==typeof e.confirm&&e.confirm();},window.__callback_emH5toNativeAlterView_cancel__=function(){"function"==typeof e.cancel&&e.cancel();};var n={title:e.title||"",content:e.content||"",okbt:{},cnacelbt:{}};try{e&&e.confirmButtonText&&(n.okbt.name=e.confirmButtonText,"function"==typeof e.confirm&&(n.okbt.event="__callback_emH5toNativeAlterView_confirm__")),e&&e.cancelButtonText&&(n.cnacelbt.name=e.cancelButtonText,"function"==typeof e.cancel&&(n.cnacelbt.event="__callback_emH5toNativeAlterView_cancel__"));}catch(e){}r.inApp(function(){r.isIOS?window.location="emH5toNativeAlterView:"+JSON.stringify(n):"undefined"!=window.__EM.prompt?window.__EM.prompt("emH5toNativeAlterView",JSON.stringify(n)):prompt("emH5toNativeAlterView",JSON.stringify(n));});},e.appInfo=r,e.closeDfcfWebview=function(){r.inApp(function(){r.isIOS?window.location="goWhere:''":"undefined"!=window.__EM.prompt?window.__EM.prompt("goWhere",""):prompt("emH5Close","");});},e.copyTxt=function(n,e){var t=!0;return r.inApp(function(){window.cb_clipboard=e||function(){},o({data:{callbackname:"cb_clipboard",content:n},if:"emH5clipBoard",af:"emH5ClipBoard"});},function(){var e=document.getElementById(n);e.select(),e.setSelectionRange(0,e.value.length),t=document.execCommand("COPY"),e.blur();}),t},e.emReloadData=function(e){var n=function(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?s(Object(t),!0).forEach(function(e){p(n,e,t[e]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e));});}return n}({},e);r.inApp(function(){r.isIOS?window.location="emh5reloaddata:"+JSON.stringify(n):prompt("emH5ReloadData",JSON.stringify(n));});},e.formateUrl=function(e){var n,t={};if(e){n=e,t.param={};try{t.query=n.split("?")[1],t.query.split("&").forEach(function(e){var n;e&&(n=e.split("="),t.param[n[0]]=n[1]);});}catch(e){}return t&&t.param}return n=window.location,t.hash=n.hash.replace("#",""),t.param={},n.search.slice(1).split("&").forEach(function(e){var n;e&&(n=e.split("="),t.param[n[0]]=n[1]);}),t&&t.param},e.getCookie=m,e.getKhDeviceInfo=function(a,e,c){r.inApp(function(){var o={euid:"",gtoken:"",appDeviceType:"",appPackageName:"",appSoftVersion:"",productName:"",channel:"",deviceBrand:"",deviceName:"",osType:"",osVersion:"",imei:"",oaid:"",androidID:"",idfa:"",idfv:"",advChnYzj:"",ip:"",emcustid:"",channel_KH:"",userID:"",isValid:1};u("deviceInfo,passport",function(e){if(e){try{var n=(e=JSON.parse(e))&&e.data;console.log("获取到的App信息为：",n);var t=n&&n.deviceInfo;o.euid=t&&t.euid,o.gtoken=t&&t.gToken,o.appDeviceType=t&&t.deviceType,o.appPackageName=t&&t.appname,o.appSoftVersion=t&&t.appversion,o.productName=t&&t.ProductType,o.deviceBrand=t&&t.deviceBrand,o.deviceName=t&&t.deviceModel,o.osType=t&&t.osType,o.osVersion=t&&t.osVersion,r.isAndroid?(o.channel=t&&t.channel,o.imei=t&&t.mobileimei,o.oaid=t&&t.oaId,o.advChnYzj=t&&t.advChnYzj,o.androidID=t&&t.emAndroidID):(o.idfa=t&&t.idfa,o.idfv=t&&t.idfv);var i=n&&n.passport;i&&(o.userID=i&&i.uid),c&&c.ad_id&&(o.channel_KH=c.ad_id);}catch(e){}a(o);}else a(o);});},function(){r.inTTJJ(function(){console.log("在天天基金App中");var e={webVisitor:m("st_pvi"),cookiesBid:m("qgqp_b_id"),ip:"",emcustid:"",channel_KH:"",userID:"",isValid:1};c&&(c.uid&&(e.userID=c.uid),c.ad_id&&(e.channel_KH=c.ad_id)),a(e);},function(){console.log(m("st_pvi"));var e={webVisitor:m("st_pvi"),cookiesBid:m("qgqp_b_id"),ip:"",emcustid:"",channel_KH:"",userID:"",isValid:1};c&&(c.uid&&(e.userID=c.uid),c.ad_id&&(e.channel_KH=c.ad_id)),a(e),console.log("加载完成");});});},e.getLoginInfo=function(t,i,e){var n=r.isTTJJ;o({data:{callbackname:"window.__n_nativeLoginStatus",callbackMethodName:"window.__n_nativeLoginStatus"},af:n?"emfundapp:getlogindata":"emH5GetLoginStatus",if:n?"emfundapp:getlogindata":"emH5GetLoginStatus",noin:e}),window.__n_nativeLoginStatus=function(e){var n="string"==typeof e?JSON.parse(e):e;0==n.code||n.uid?t&&t(n):i&&i(n);};},e.getModuleInfo=u,e.getOpenAccountLink=function(e){var n;return e=e||"",r.inApp(function(){n="prod"==c?"https://openapp.eastmoney.com/Regist/GotoTransferUser?source=&showBack=1&disablertc=0&redirectdownload=1&disablefund=1&isapp=1"+e:"http://10.10.81.158:8060/Regist/GotoTransferUser?source=&showBack=1&disablertc=0&redirectdownload=1&disablefund=1&isapp=1"+e;},function(){n="prod"==c?"https://khh5.eastmoney.com/Regist/GotoTransferUser?source=&showBack=1&disablertc=1&redirectdownload=1&disablefund=1"+e:"https://ceshi.securities.eastmoney.com:7151/Regist/GotoTransferUser?source=&showBack=1&disablertc=1&redirectdownload=1&disablefund=1"+e;}),n},e.nShare=function(t){r.inApp(function(){var e;(e=t).type=e.type||"weixin,pengyouquan,weibo,message,qq",o({data:e,af:"onShareClicked",if:"onwebshareclicked"});}),r.inTTJJ(function(){var e,n;n={data:{WxTitle:(e=t).title,shareTypes:[0,1,2,3],HasWx:!0,WxContent:e.desc,WxUrl:e.url,WxImage:e.img,busitype:0},af:"emfundapp:wx_shareinfo",if:"emfundapp:wx_shareinfo"},o(n),setTimeout(function(){o({af:"emfundapp:ttjj-huodong-weixin-share",if:"emfundapp:ttjj-huodong-weixin-share"});},200);});},e.openApp=function(e){var n={callbackname:"download_app_emk"};window.download_app_emk=e.cb,r.isIOS?n.scheme=e.ios_scheme||"eastmoneyjijin://":n=g(g({},n),{},{appname:e.appName,isLocal:e.isLocal||!1,scheme:e.android_scheme||"eastmoneyjijin://startapp/"}),n=g(g({},n),{},{packagename:e.appName,downloadurl:e.url}),r.inApp(function(){o({data:n,if:"emh5toopenapp",af:"emH5toOpenApp"});},function(){r.inTTJJ(function(){o({data:n,if:"emfundapp:open-other-app",af:"emfundapp:open-other-app"});});});},e.openAppStore=function(e){var n=0<arguments.length&&void 0!==e?e:"com.eastmoney.android.berlin",t=!1;r.inApp(function(){r.isAndroid?h("market://details?id="+n):t=!0;},function(){r.inTTJJ(function(){r.isAndroid?window.location.href='emfundapp:appstore-detail:({"appid":"'+n+'"})':t=!0;},function(){r.isAndroid?r.isWeChat||r.isQQ||(window.location.href="market://details?id="+n):t=!0;});}),r.isIOS&&t&&(window.location.href="http://acttg.eastmoney.com/pub/xxlout_dfcfappdfcf_random_0000287a");},e.openDeepLink=h,e.openOtherApp=function(t){window.__callback_openOtherApp=function(e){if(e){"string"==typeof e&&(e=JSON.parse(e));try{var n;e&&1==e.code&&((n=e&&e.data)&&n.isinstall||n&&n.isInstall)||t.cb;}catch(e){t.cb;}}};var e={packageName:"",scheme:""};r.isIOS?e.scheme=t.ios_scheme||"eastmoneyjijin://":(e.scheme=t.android_scheme||"eastmoneyjijin://startapp/",e.packageName=t.appName||"com.eastmoney.android.fund",e.isLocal=t.isLocal||!1);var n={moduleName:"Router",methodName:"openApp",requestJson:e,callbackName:"__callback_openOtherApp"};r.inApp(function(){r.isIOS?window.location="callHybridMethod:"+JSON.stringify(n):"undefined"!=__EM&&"undefined"!=__EM.prompt?__EM.prompt("callHybridMethod",JSON.stringify(n)):prompt("callHybridMethod",JSON.stringify(n));},function(){window.location.href=e.scheme;});},e.openTTJJNativeLogin=function(e,n,t){r.inTTJJ(function(){window.emfundLoginCancel=n,window.setCustomerNo=e,window.location.href="emfundapp:tradelogin";},function(){t&&t();});},e.openWebView=function(n){var t={titlebartype:"",emthemetype:"",url:""};"string"==typeof n?t.url=n:t=g(g({},t),n),r.inApp(function(){var e="dfcft://webh5";r.isIOS&&(e="eastmoney://wireless/h5/trade"),window.location.href=e+"?titlebartype=".concat(t.titlebartype,"&emthemetype=").concat(t.emthemetype,"&url=").concat(encodeURIComponent(n));},function(){r.inTTJJ(function(){t=g(g({},t),{},{oldwinrelease:t.closewebview||!1,noparam:!1}),o({data:t,if:"emfundapp:gonewpage",af:"emfundapp:gonewpage"});},function(){r.isIOS?window.location.href="eastmoney://wireless/h5/trade?url="+t.url:window.location.href="dfcft://router/h5?url="+t.url;});});},e.pageEnv=c,e.perform=o,e.performNativeLogin=function(t,i){o({data:{callbackname:"window.__n_nativeLogin"},af:"emH5NativeLogin",if:"emH5NativeLogin"}),window.__n_nativeLogin=function(e){var n=JSON.parse(e);0==n.code?t&&t(n):i&&i(n);};},e.request=function(e,n){e&&(e.callback="_native_request_callback"),window._native_request_callback=n,r.inApp(function(){window.location.href="eastmoney://wireless/js/datarequest?data="+encodeURIComponent(JSON.stringify(e));},function(){console.error("没有在app内 就调用了 原生请求。");});},e.setTitle=function(e,n){var t={};e&&(t.title1=e,n&&(t.title2=n)),o({data:t,if:"emH5Title",af:"emH5Title"});},e.shareScreenShotImage=function(n){var e="__callback_emShareScreenShotImage__".concat((new Date).getTime());window[e]=function(e){"function"==typeof n.success&&n.success(e);};var t={type:n.type||"weixin,pengyouquan,weibo",height:n.height||1041,needqrcode:n.needqrcode||0,needtitlebar:n.needtitlebar||0,callbackname:e};r.inApp(function(){if(r.isIOS)try{eastmoney.emShareScreenShotImage(JSON.stringify(t));}catch(e){}else"undefined"!=window.__EM.prompt?window.__EM.prompt("emShareScreenShotImage",JSON.stringify(t)):prompt("emShareScreenShotImage",JSON.stringify(t));});},e.showBtn=function(e){var n={data:{type:e.type,enable:e.enable,btntext:e.btntext},af:"emSetTitleRightBtn",if:"emSetTitleRightBtn"};window.emH5ShareInfo=e.cb,o(n);},e.ttjjLinkTo=function(e){var n;e&&"h5"==e.type?n={LinkType:2,LinkTo:e.linkto,IsVerifyLogin:e.isverifylogin,CloseCurrentPage:e.closewebview}:e&&"deeplink"==e.type?n={LinkType:1,LinkTo:e.linkto,IsVerifyLogin:e.isverifylogin,CloseCurrentPage:e.closewebview}:e&&"weex"==e.type&&(n={LinkType:2,LinkTo:e.linkto,IsVerifyLogin:e.isverifylogin,CloseWeex:e.closewebview}),r.inTTJJ(function(){o({data:n,if:"emfundapp:ttjj-linkto",af:"emfundapp:ttjj-linkto"});});},e.ttjjShowBtn=function(e){var n={data:{WxTitle:e.title,shareTypes:[0,1,2,3],HasWx:!0,WxContent:e.desc,WxUrl:e.url,WxImage:e.img,busitype:0},af:"emfundapp:wx_shareinfo",if:"emfundapp:wx_shareinfo"};o(n);},e.wxDfcfShare=function(e){var n,t;r.isWeChat&&(n={title:e.title||document.title,desc:e.desc||"分享",link:e.url||window.location.href,type:"weixin,pengyouquan",imgUrl:e.img||"",fail:function(){},trigger:function(){e.trigger&&e.trigger();},success:function(){e.success&&e.success();},cancel:function(){e.cancel&&e.cancel();}},t="dfcfshare_cb_".concat((new Date).valueOf()),d("https://res.wx.qq.com/open/js/jweixin-1.6.0.js",function(){d("https://hy.eastmoney.com/emwx2019/GetJsSdkUiPackage?s=".concat(encodeURIComponent(window.location.href),"&cb=").concat(t,"&id=3"),function(){console.log("加载完毕app id");});}),window["".concat(t)]=function(e){console.log(e),wx.config({debug:!1,appId:e.AppId,timestamp:e.Timestamp,nonceStr:e.NonceStr,signature:e.Signature,jsApiList:["checkJsApi","onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo"]}),wx.ready(function(){wx.onMenuShareAppMessage(n),wx.onMenuShareTimeline(n),wx.onMenuShareQQ(n),wx.onMenuShareWeibo(n);});});},e.wxShare=function(e){var n,t;r.isWeChat&&(n=l(l({},n={title:e.title||document.title,desc:e.desc||"分享",link:e.url||window.location.href,type:"weixin,pengyouquan",imgUrl:e.img||"",fail:function(){},trigger:function(){e.trigger&&e.trigger();},success:function(){e.succ&&e.succ();},cancel:function(){e.cancel&&e.cancel();}}),e),t="share_cb_".concat((new Date).valueOf()),d("https://res.wx.qq.com/open/js/jweixin-1.6.0.js",function(){d("https://wechat.eastmoney.com/api/WX/GetJsSdkUiPackage/1?s=".concat(encodeURIComponent(window.location.href),"&cb=").concat(t),function(){console.log("加载完毕app id");});}),window["".concat(t)]=function(e){wx.config({debug:!1,appId:e.AppId,timestamp:e.Timestamp,nonceStr:e.NonceStr,signature:e.Signature,jsApiList:["checkJsApi","onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareWeibo"]}),wx.ready(function(){wx.onMenuShareAppMessage(n),wx.onMenuShareTimeline(n),wx.onMenuShareQQ(n),wx.onMenuShareWeibo(n);});});},Object.defineProperty(e,"__esModule",{value:!0});});
  });

  var emk = unwrapExports(mku_min);

  var emk$1 = _objectSpread2({}, emk);

  var index = _objectSpread2({
    njsentryCenter: SentryCenter,
    njutil: util
  }, emk$1);

  return index;

}));
