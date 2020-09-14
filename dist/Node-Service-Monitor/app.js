"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var schedule = require("node-schedule");
var nodesm_config_1 = require("../nodesm.config");
var Axios_1 = require("Axios");
// 发送邮件组件
var nodemailer = require("nodemailer");
console.log('Node-Service-Monitor starting...');
// 检测各种服务ing
var startTask = function () {
    //每分钟的第30秒定时执行一次:
    var rule = new schedule.RecurrenceRule();
    rule.second = 0;
    rule.minute = [];
    for (var i = 0; i < 60; i++) {
        rule.minute.push(i);
    }
    taskEvent();
    schedule.scheduleJob(rule, function () {
        taskEvent();
    });
};
startTask();
function taskEvent() {
    // console.log('scheduleCronstyle:' + new Date())
    var _this = this;
    nodesm_config_1.service.forEach(function (serviceItem) {
        // console.log(serviceItem.apis)
        serviceItem.apis.forEach(function (apiItem) { return __awaiter(_this, void 0, void 0, function () {
            var res_1, error_1, bool_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Axios_1.default({
                                method: apiItem.method,
                                url: apiItem.url,
                                params: apiItem.params,
                                data: apiItem.data,
                            })
                            // console.log(apiItem.method, res.status, res.data)
                        ];
                    case 1:
                        res_1 = _a.sent();
                        // console.log(apiItem.method, res.status, res.data)
                        if (!res_1) {
                            report(serviceItem, apiItem.url, res_1.status, res_1.data);
                        }
                        if (res_1.status === 404) {
                            report(serviceItem, apiItem.url, res_1.status, res_1.data);
                        }
                        if (res_1.status >= 500) {
                            report(serviceItem, apiItem.url, res_1.status, res_1.data);
                        }
                        apiItem.denyAllow.status.forEach(function (status) {
                            if (res_1.status === status) {
                                report(serviceItem, apiItem.url, res_1.status, res_1.data);
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        bool_1 = true;
                        apiItem.allow.status.forEach(function (status) {
                            if (error_1.response.status === status) {
                                bool_1 = false;
                            }
                        });
                        bool_1 &&
                            report(serviceItem, apiItem.url, error_1.response.status || 404, error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    });
}
function report(serviceItem, url, status, error) {
    var _this = this;
    // console.log('服务异常了')
    // console.log(serviceItem.name, url, status, error)
    // sendEmail()
    nodesm_config_1.email.forEach(function (emailItem) { return __awaiter(_this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!((serviceItem.createTime || 0) <= getDate().UTC)) return [3 /*break*/, 2];
                    return [4 /*yield*/, sendEmail({
                            email: emailItem,
                            serviceName: serviceItem.name,
                            platform: serviceItem.platform,
                            url: url,
                            status: status,
                            error: JSON.stringify(error),
                            title: 'PSS后端服务 "' + serviceItem.name + '" 发生了异常',
                            author: 'PSS Hera System · NodeJS · 后端服务心跳监测系统',
                        })
                        // console.log(res)
                    ];
                case 1:
                    res = _a.sent();
                    // console.log(res)
                    if (res) {
                        serviceItem.createTime = getDate().UTC + 3600 * 1;
                        // console.log(serviceItem.createTime)
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
// 发送邮件
function sendEmail(data) {
    return new Promise(function (res, rej) {
        var content = "\n      <p>\u670D\u52A1\u540D\uFF1A" +
            data.serviceName +
            "</p>\n      <p>\u540E\u7AEF\u8BED\u8A00\uFF1A" +
            data.platform +
            "</p>\n      <p>\u5FC3\u8DF3\u68C0\u6D4B\u5730\u5740\uFF1A" +
            data.url +
            "</p>\n      <p>\u72B6\u6001\u7801\uFF1A" +
            data.status +
            "</p>\n      <p>\u9519\u8BEF\u4FE1\u606F\uFF1A" +
            data.error +
            "</p>\n    ";
        // 发送邮件验证
        var mailTransport = nodemailer.createTransport({
            host: nodesm_config_1.emailOption.host,
            port: 465,
            auth: {
                user: nodesm_config_1.emailOption.user,
                pass: nodesm_config_1.emailOption.pass,
            },
        });
        mailTransport.sendMail({
            //你的邮箱
            from: nodesm_config_1.emailOption.user,
            //发给谁
            to: data.email,
            // 标题
            subject: data.title || '爱喵日记馆',
            //附件信息
            attachments: data.attachments || [],
            html: getMailContent({
                title: data.title,
                html: content || data.content,
                author: data.author || '爱喵日记馆',
                time: getDate().time,
            }),
        }, function (err, info) {
            console.log(err, info);
            if (err) {
                res(!1);
            }
            res(!0);
        });
    });
}
function getDate(val) {
    var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
    var de = null;
    var tip = null;
    var longTip = null;
    var long = null;
    var mid = null;
    var shortDate = null;
    var shortTime = null;
    var now = new Date();
    if (val) {
        de = new Date(val);
    }
    else {
        de = new Date();
    }
    var year = de.getFullYear();
    var month = de.getMonth() + 1;
    var date = de.getDate();
    var hour = de.getHours() < 10 ? '0' + de.getHours() : de.getHours();
    var minute = de.getMinutes() < 10 ? '0' + de.getMinutes() : de.getMinutes();
    var second = de.getSeconds() < 10 ? '0' + de.getSeconds() : de.getSeconds();
    var milli = de.getMilliseconds() < 100
        ? de.getMilliseconds() < 10
            ? '00' + de.getMilliseconds()
            : '0' + de.getMilliseconds()
        : de.getMilliseconds();
    var week = weekArr[de.getDay()];
    var UTC = de.getTime();
    var yesterday = new Date(now.getFullYear() +
        '/' +
        (now.getMonth() + 1) +
        '/' +
        now.getDate() +
        ' 0:0:0').getTime();
    var beforeYesterday = yesterday - 1000 * 60 * 60 * 24;
    var lastYear = new Date(now.getFullYear() + '/' + 1 + '/' + 1 + ' 0:0:0').getTime();
    if (de.getTime() >= yesterday) {
        var dayTip = '';
        if (de.getHours() >= 0 && de.getHours() <= 4) {
            dayTip = '凌晨';
        }
        if (de.getHours() >= 5 && de.getHours() <= 8) {
            dayTip = '早晨';
        }
        if (de.getHours() >= 9 && de.getHours() <= 11) {
            dayTip = '上午';
        }
        if (de.getHours() >= 12 && de.getHours() < 13) {
            dayTip = '中午';
        }
        if (de.getHours() >= 13 && de.getHours() <= 18) {
            dayTip = '下午';
        }
        if (de.getHours() >= 19 && de.getHours() <= 23) {
            dayTip = '晚上';
        }
        tip = dayTip + ' ' + hour + ':' + minute;
        longTip = dayTip + ' ' + hour + ':' + minute;
    }
    if (de.getTime() >= beforeYesterday && de.getTime() < yesterday) {
        tip = '昨天 ' + hour + ':' + minute;
        longTip = '昨天 ' + hour + ':' + minute;
    }
    if (de.getTime() < beforeYesterday) {
        // + (hour) + ':' + minute
        tip = month + '月' + date + '日 ' + hour + ':' + minute;
        longTip = month + '月' + date + '日 ' + hour + ':' + minute;
        if (de.getTime() < lastYear) {
            // + (hour) + ':' + minute
            tip = year + '年' + month + '月' + date + '日 ';
            longTip = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute;
        }
    }
    long =
        year +
            '年' +
            month +
            '月' +
            date +
            '日 星期' +
            week +
            ' ' +
            hour +
            ':' +
            minute;
    mid = year + '年' + month + '月' + date + '日 ' + ' ' + hour + ':' + minute;
    // 去年吗？
    if (de.getTime() < lastYear) {
    }
    shortDate = year + '年' + month + '月' + date + '日 星期' + week;
    shortTime = hour + ':' + minute;
    return {
        year: year,
        month: month,
        date: date,
        hour: hour,
        minute: minute,
        second: second,
        milli: milli,
        week: week,
        UTC: Math.floor(UTC / 1000),
        tip: tip,
        long: long,
        shortDate: shortDate,
        shortTime: shortTime,
        longTip: longTip,
        mid: mid,
        newDate: new Date(UTC),
        birthday: year + '-' + month + '-' + date,
        birthdayCn: year + '年' + month + '月' + date + '日',
        monthOrDate: month + '-' + date,
        fullShortTime: hour + ':' + minute + ':' + second,
        time: year +
            '-' +
            month +
            '-' +
            date +
            ' ' +
            hour +
            ':' +
            minute +
            ':' +
            second,
        cnTime: year +
            '年' +
            month +
            '月' +
            date +
            '日 ' +
            hour +
            '时' +
            minute +
            '分' +
            second +
            '秒',
    };
}
// 获取email富文本
function getMailContent(data) {
    var bg = '';
    // var bg = 'https://api.aiiko.club/public/images/default_bg/bg-april.jpg'
    return ("\n  <table class=\"tbl\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"\n        style=\"width: 100%;position: relative;background-image: url('" +
        bg +
        "');background-size: cover;border-collapse: collapse;background-color: #ebedf0;font-family: 'Alright Sans LP', 'Avenir Next', 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Source Han Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi MicroHei', sans-serif;\">\n        <style>\n            .tbl {}\n\n            @media screen and (max-width: 767px) {\n                .tbl {\n                    background-image: url('" +
        bg +
        "');\n                }\n            }\n\n            .sub-tb {}\n\n            @keyframes animaMoveX {\n                0% {\n                    transform: translate(0, 0);\n                }\n\n                100% {\n                    transform: translate(30px, 0);\n                }\n            }\n\n            .tbl .td-main {}\n\n            @media screen and (max-width: 767px) {\n\n                .tbl .td-main {\n                    padding: 40px 20px 0;\n                }\n            }\n\n            .tbl .td-main {\n              width: 100%;\n            }\n            .tbl .td-main  table{\n              width: 100%;\n            }\n\n            .tbl .td-main img {\n                max-width: 100%;\n            }\n\n            .tbl .td-main a {\n                color: #e78771;\n            }\n\n            .tbl .link td {}\n\n            .tbl .link td p {}\n\n            .tbl .link td p a {}\n        </style>\n        <tbody class=\"tbl-body\">\n            <tr>\n                <td>\n                    <table class=\"sub-tb\" cellpadding=\"0\" cellspacing=\"0\" align=\"center\"\n                        style=\"margin: 0 auto;width: 100%;max-width: 800px;padding: 0 15px;\">\n                        <tbody>\n                            <tr>\n                                <td style=\"height:20px;\"></td>\n                            </tr>\n                            <tr>\n                                <td height=\"10\"></td>\n                            </tr>\n                            <tr>\n                                <td height=\"40\"></td>\n                            </tr>\n                            <tr>\n                                <td class=\"td-main\"\n                                    style=\"background-color: rgb(255, 255, 255, 0.9);border-radius: 6px; padding: 40px 20px 0;font-size: 16px;margin: 0 auto;\">\n                                    <table>\n                                        <tbody>\n                                            <tr height=\"40\">\n                                                <td style=\"font-size:18px;font-family:'\u5FAE\u8F6F\u96C5\u9ED1','\u9ED1\u4F53',arial;\">\n                                                    " +
        data.title +
        "\n                                                </td>\n                                            </tr>\n                                            <tr height=\"15\">\n                                                <td></td>\n                                            </tr>\n                                            <tr height=\"30\" class=\"tr-main\">\n                                                <td>\n                                                " +
        data.html +
        "\n                                                </td>\n\n                                            </tr>\n                                            <tr height=\"20\">\n                                                <td></td>\n                                            </tr>\n                                            <tr>\n                                                <td\n                                                    style=\"text-align:right;padding-left:55px;paddingfont-family:'\u5FAE\u8F6F\u96C5\u9ED1','\u9ED1\u4F53',arial;font-size:14px;\">\n                                                    <br>\n                                                    <span style=\"color:#555\">" +
        (data.author || "\u7231\u55B5\u65E5\u8BB0\u9986") +
        "</span>\n                                                    <br>\n                                                    <span style=\"color:#888\">\u53D1\u4EF6\u4E8E " +
        data.time +
        "</span>\n                                                </td>\n                                            </tr>\n                                            <tr height=\"50\">\n                                                <td></td>\n                                            </tr>\n                                        </tbody>\n                                    </table>\n                                </td>\n                            </tr>\n                            <tr>\n                                <td style=\"height:40px;\"></td>\n                            </tr>\n                            <tr class=\"link\">\n                                <td style=\"text-align: center;color: #555;font-size: 12px;\">\n                                    <p style=\"line-height: 20px;\">\n                                        <span\n                                            style=\" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;\">Copyright\n                                            \u00A9 2019 - 2020</span>\n                                        <a href=\"https://www.peacent.com/\" target=\"_blank\"\n                                            style=\" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;\">\u62FC\u8BF4\u8BF4\u5B98\u7F51</a>\n                                    </p>\n                                    <p style=\"line-height: 20px;\">\n                                        <a href=\"https://creation.peacent.com/\"\n                                            style=\" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;\"\n                                            target=\"_blank\">\u521B\u4F5C\u4E2D\u5FC3</a> -\n                                        <a href=\"https://www.peacent.com/about\" target=\"_blank\"\n                                            style=\" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;\">\u5173\u4E8E\u6211\u4EEC</a>\n                                        -\n                                        <a href=\"mailto:cat@peacent.com\"\n                                            style=\" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;\">\u5F00\u53D1\u8005\u90AE\u7BB1</a>\n                                    </p>\n                                    <!-- <p style=\"line-height: 20px;\">\n                                        <span style=\" text-decoration: none;color: #555; padding: 0 0px;font-size: 16px;\">\u5982\u60A8\u4E0D\u60F3\u518D\u63A5\u53D7\u63A8\u9001\u90AE\u4EF6\u4E86\u3002\u53EF\u70B9\u6211</span><a href=\"https://www.aiiko.club/app/setting\"\n                                        style=\" text-decoration: none;color: #555;font-weight: 700; padding: 0 0px;font-size: 16px;\"\n                                        target=\"_blank\">\u9000\u8BA2</a><span style=\" text-decoration: none;color: #fff; padding: 0 0px;font-size: 16px;\">\u63A8\u9001</span>\n                                    </p> -->\n                                </td>\n                            </tr>\n                            <tr>\n                                <td style=\"height:50px;\"></td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n    ");
}
