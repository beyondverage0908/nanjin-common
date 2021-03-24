# Sentry日志上报

**Sentry日志上报仅限于在浏览器端使用**

## 安装nanjing-commom

```shell
npm i nanjin-common
or
yarn add nanjin-common
```



## 引入

1. esm模块引入

	```javascript
	import { sentryCenter } from 'nanjin-common';
	```

2. 通过浏览器script引入，则会在window对象中暴露`NJK`对象

   ```javascript
   var { sentryCenter } = NJK
   ```

## 使用Sentry日志上报

1. 初始化

   **initSentry(dsn, [env, [callback, [debug]]])**

   | 参数名   | 类型     | 是否必填 | 说明                                   | 默认  |
   | -------- | -------- | -------- | -------------------------------------- | ----- |
   | dsn      | String   | true     | sentry上报的地址，从日志平台sentry申请 |       |
   | env      | String   | false    | 上报环境配置                           | Prod  |
   | callback | Function | false    | 日志每次上报前的回调                   |       |
   | debug    | Boolean  | false    | 是否开启调试模式                       | false |

示例：

```javascript
import { sentryCenter } from 'nanjin-common';
// dsn从sentry日志平台申请
var dsn = 'https://40e864d11d8c4979a1dd3cba0039ac12@femonitor.eastmoney.com//25'
// Dev or Prod
var env = 'Prod'; 
// 上报前回调方法
var callback = function() {
    console.log('before send message callback')
}
var isDebug = false
sentryCenter.initSentry(dsn, env, callback, false)
```

2. 全局设置日志基础信息

   **setSentry([tags, [user]])**

   | 参数名 | 类型                              | 是否必填 | 说明     | 默认 |
   | ------ | --------------------------------- | -------- | -------- | ---- |
   | tags   | Array<key: String, value: String> | 否       | 事件标签 |      |
   | user   | Object                            | 否       | 用户标签 |      |

   示例：

   ```javascript
   import { sentryCenter } from 'nanjin-common';
   function sentrySendMessage(type, title, infoCode, errMsg, uuid){
       try {
           // 设置事件全局标签
           sentryCenter.setSentry([{
               key: 'uuid',
                   value:uuid
               },
               {
                   key: 'infoCode',
                   value: infoCode
               },
               {
                   key: 'response',
                   value: errMsg
               }
           ]);
           sentryCenter.sendMessage({
               title: title,
               level: type,
               extra: {
                   msg: `infoCode:${infoCode},uuid:${uuid},异常错误：${errMsg}`
               }
           });
       } catch (error) {
           console.log(error)
       }
   }
   ```

   3. 发送sentry日志消息

      **sendMessage([config])**

| 参数名 | 类型           | 是否必填 | 说明                 | 默认值 |
| ------ | -------------- | -------- | -------------------- | ------ |
| config | Object<Config> | 是       | 发送消息日志主体内容 |        |

**Config**

| 参数名 | 类型             | 是否必填 | 说明                                             | 默认值 |
| ------ | ---------------- | -------- | ------------------------------------------------ | ------ |
| title  | String           | 是       | 事件标题                                         |        |
| level  | String           | 否       | 五个可选值：fatal，error，warning，info，和debug | ''     |
| finger | String           | 否       | 指纹                                             | ''     |
| user   | Object           | 否       | 用户标签                                         |        |
| extra  | String \| Object | 否       | 扩展信息                                         | ''     |

示例：

```javascript
import { sentryCenter } from 'nanjin-common';
function sentrySendMessage(level, title, infoCode, errMsg, user){
    try {
        sentryCenter.sendMessage({
            title: title,
            level: level,
            user: user,
            extra: {
                msg: `infoCode:${infoCode}, 异常错误：${errMsg}`
            }
        });
    } catch (error) {
        console.log(error)
    }
}
```

4. 发送错误日志信息

   **sendError(title, [extra, [config]])**

| 参数名 | 类型             | 是否必填 | 说明         | 默认值 |
| ------ | ---------------- | -------- | ------------ | ------ |
| title  | String           | 是       | 错误日志标题 | ''     |
| extra  | String \| Object | 否       | 扩展信息     | ''     |
| config | Object<Config>   | 否       | 配置字段     |        |

**Config**

| 参数名 | 类型   | 是否必填 | 说明     | 默认值 |
| ------ | ------ | -------- | -------- | ------ |
| finger | String | 否       | 指纹     | ''     |
| user   | Object | 否       | 用户标签 |        |