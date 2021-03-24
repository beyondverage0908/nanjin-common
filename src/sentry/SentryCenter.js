/**
 * Sentry v1.0.3 前端日志监控封装
 * @authors wangjun3 (wangjun3@eastmoney.com)
 * @date    2020-05-22 10:08:50
 */
// Sentry start
const SentryCenter = {
	/**
     * 日志SDK加载方法
     * @param {string} dsn 项目配置地址
     * @param {string} environment 设置日志环境，默认Prod，Dev/Test/Prod
     * @param {function} callback 回调函数
     * @param {boolean} debug 是否开启调试模式 默认false
     */
	 loadSDK: function(dsn, environment, callback, debug) {
        try {
            if (!this.isLowIE(9)) {
                var SentrySdk = document.createElement('script');
                SentrySdk.src = 'https://premiumcdn.eastmoney.com/common/js/sentry/sentry.5.15.4.min.js';
                SentrySdk.defer = true;
                SentrySdk.onload = function() {
                    SentryCenter.initSentry(dsn, environment, callback, debug);
                }
                document.head.appendChild(SentrySdk);
            }
        } catch(e) {
            console.log(e)
        }
    },
    /**
     * 日志初始化
     * @param {string} dsn 项目配置地址
     * @param {string} environment 设置日志环境，默认Prod，Dev/Test/Prod
     * @param {function} callback 回调函数
     * @param {boolean} debug 是否开启调试模式 默认false
     */
    initSentry: function(dsn, environment, callback, debug) {
        try {
            if (SentryCenter.isLowIE(9)) {
                return false
            }
            // 针对动态引入sdk 做检测，避免因动态引入抛错
            if (!window.Sentry) {
				SentryCenter.loadSDK(dsn, environment, callback, debug)
                return false
            }
            Sentry.init({
                dsn: dsn,
                environment: environment || 'Prod',
                debug: debug || false,
                beforeSend: function(event) {
                    // 发送日志前处理函数
                    if (typeof window.SentrybeforeSend == 'function') {
                        window.SentrybeforeSend(event);
                    }
                    return event
                }
            });
            (callback && typeof callback == 'function') ? window.SentrybeforeSend = callback : '';
        } catch(e) {
            console.log(e)
        }
    },
    /**
     * 设置日志基础信息
	 *  @param {array} tags 设置全局事件标签 [{key: '', value: ''}]
	 *  @param {Object} user 设置全局用户标签
     */
    setSentry: function(tags, user) {
        try {
            tag = tag || [];
            Sentry.configureScope(function(scope) {
                if (Array.isArray(tags) && tags.length) {
                    // 事件标签
                    for(var i = 0; i < tags.length; i++) {
                        scope.setTag(tags[i].key, tag[i].value);
                    }
                }
                // 用户信息
                user ? scope.setUser(user) : '';
            });
        } catch(e) {}
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
    sendError: function(title, extra, config) {
        try {
            config = config || {};
            Sentry.withScope(function(scope) {
                config.finger ? scope.setFingerprint(config.finger) : '';
                config.user ? scope.setUser(config.user) : '';
                scope.setExtra('remark', extra || '');
                Sentry.captureException(new Error(title));
            });
        } catch(e) {
            console.log(e)
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
    sendMessage: function(config) {
        try {
            config.level = config.level || '';
            Sentry.withScope(function(scope) {
                config.finger ? scope.setFingerprint(config.finger) : '';
                config.user ? scope.setUser(config.user) : '';
                scope.setExtra('remark', config.extra || '');
                Sentry.captureMessage(config.title, config.level);
            });
        } catch(e) {}
    },
    /**
     * 显示用户反馈
     * @param {string} eventId 日志事件ID 可选 默认读取上一次事件ID
     * 如需定制弹窗 可自行调用Sentry.showReportDialog调整相应参数使用
     */
    showUserReport: function(eventId) {
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
                successMessage: '您的反馈已发送。谢谢！',
            });
        } catch(e) {}
    },
    isLowIE: function(base) {
        base = +(base || 8);
        if (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) < base) {
            return true
        }
        return false
    }
}

export default SentryCenter