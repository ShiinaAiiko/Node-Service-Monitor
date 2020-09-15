import schedule = require('node-schedule')
import { service, email, emailOption } from '../nodesm.config'
import Axios from 'axios'

// 发送邮件组件
import nodemailer = require('nodemailer')

console.log('Node-Service-Monitor starting...')

// 检测各种服务ing
const startTask: any = () => {
	//每分钟的第30秒定时执行一次:
	var rule = new schedule.RecurrenceRule()
	rule.second = 0
	rule.minute = []
	for (let i = 0; i < 60; i++) {
		rule.minute.push(i)
	}
	taskEvent()
	schedule.scheduleJob(rule, () => {
		taskEvent()
	})
}

startTask()

function taskEvent() {
	// console.log('scheduleCronstyle:' + new Date())

	service.forEach((serviceItem: any) => {
		// console.log(serviceItem.apis)
		serviceItem.apis.forEach(async (apiItem: any) => {
			try {
				// console.log(apiItem)
				let res: any = await Axios({
					method: apiItem.method,
					url: apiItem.url,
					params: apiItem.params,
					data: apiItem.data,
				})
				// console.log(apiItem.url,apiItem.method, res.status, res.data)
				if (!res) {
					report(serviceItem, apiItem.url, res.status, res.data)
				}
				if (res.status === 404) {
					report(serviceItem, apiItem.url, res.status, res.data)
				}
				if (res.status >= 500) {
					report(serviceItem, apiItem.url, res.status, res.data)
				}
				apiItem.denyAllow.status.forEach((status: number) => {
					if (res.status === status) {
						report(serviceItem, apiItem.url, res.status, res.data)
					}
				})
			} catch (error) {
				if (!error.response) {
					report(serviceItem, apiItem.url, 404, error)
					return
				}
				let bool: Boolean = true

				if (
					apiItem.allow &&
					apiItem.allow.status &&
					apiItem.allow.status.length
				) {
					apiItem.allow.status.forEach((status: number) => {
						if (error.response.status === status) {
							bool = false
						}
					})
				}
				bool &&
					report(serviceItem, apiItem.url, error.response.status || 404, error)
			}
		})
	})
}

function report(serviceItem: any, url: string, status: number, error: any) {
	// console.log('服务异常了')
	// console.log(serviceItem.name, url, status, error)
	// sendEmail()
	email.forEach(async (emailItem: string) => {
		console.log(serviceItem.testCount)
		// console.log(serviceItem.createTime,(serviceItem.createTime || 0) <= getDate().UTC)
		if ((serviceItem.createTime || 0) <= getDate().UTC) {
			if ((serviceItem.testCount || 0) < 3) {
				serviceItem.testCount && serviceItem.testCount++
				!serviceItem.testCount && (serviceItem.testCount = 1)
				return
			}
			let res = await sendEmail({
				email: emailItem,
				serviceName: serviceItem.name,
				platform: serviceItem.platform,
				url,
				status,
				error: JSON.stringify(error),
				title: 'PSS后端服务 "' + serviceItem.name + '" 发生了异常',
				author: 'PSS Hera System · NodeJS · 后端服务心跳监测系统',
			})
			// console.log(res)
			if (res) {
				serviceItem.testCount = 0
				serviceItem.createTime = getDate().UTC + 3600 * 1
				// console.log(serviceItem.createTime)
			}
		}
	})
}

// 发送邮件
function sendEmail(data: any): any {
	return new Promise((res, rej) => {
		let content: string =
			`
      <p>服务名：` +
			data.serviceName +
			`</p>
      <p>后端语言：` +
			data.platform +
			`</p>
      <p>心跳检测地址：` +
			data.url +
			`</p>
      <p>状态码：` +
			data.status +
			`</p>
      <p>错误信息：` +
			data.error +
			`</p>
    `
		// 发送邮件验证
		let mailTransport: any = nodemailer.createTransport({
			host: emailOption.host,
			port: 465,
			auth: {
				user: emailOption.user,
				pass: emailOption.pass,
			},
		})

		mailTransport.sendMail(
			{
				//你的邮箱
				from: emailOption.user,
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
				// 内容
				// text: data.text || '欢迎您使用爱喵日记馆'
			},
			function (err, info) {
				console.log(err, info)
				if (err) {
					res(!1)
				}
				res(!0)
			}
		)
	})
}

function getDate(val?: Date) {
	let weekArr = ['日', '一', '二', '三', '四', '五', '六']
	let de = null
	let tip = null
	let longTip = null
	let long = null
	let mid = null
	let shortDate = null
	let shortTime = null
	let now = new Date()
	if (val) {
		de = new Date(val)
	} else {
		de = new Date()
	}

	let year = de.getFullYear()
	let month = de.getMonth() + 1
	let date = de.getDate()
	let hour = de.getHours() < 10 ? '0' + de.getHours() : de.getHours()
	let minute = de.getMinutes() < 10 ? '0' + de.getMinutes() : de.getMinutes()
	let second = de.getSeconds() < 10 ? '0' + de.getSeconds() : de.getSeconds()
	let milli =
		de.getMilliseconds() < 100
			? de.getMilliseconds() < 10
				? '00' + de.getMilliseconds()
				: '0' + de.getMilliseconds()
			: de.getMilliseconds()
	let week = weekArr[de.getDay()]
	let UTC = de.getTime()

	var yesterday = new Date(
		now.getFullYear() +
			'/' +
			(now.getMonth() + 1) +
			'/' +
			now.getDate() +
			' 0:0:0'
	).getTime()
	var beforeYesterday = yesterday - 1000 * 60 * 60 * 24
	var lastYear = new Date(
		now.getFullYear() + '/' + 1 + '/' + 1 + ' 0:0:0'
	).getTime()

	if (de.getTime() >= yesterday) {
		var dayTip = ''
		if (de.getHours() >= 0 && de.getHours() <= 4) {
			dayTip = '凌晨'
		}
		if (de.getHours() >= 5 && de.getHours() <= 8) {
			dayTip = '早晨'
		}
		if (de.getHours() >= 9 && de.getHours() <= 11) {
			dayTip = '上午'
		}
		if (de.getHours() >= 12 && de.getHours() < 13) {
			dayTip = '中午'
		}
		if (de.getHours() >= 13 && de.getHours() <= 18) {
			dayTip = '下午'
		}
		if (de.getHours() >= 19 && de.getHours() <= 23) {
			dayTip = '晚上'
		}
		tip = dayTip + ' ' + hour + ':' + minute
		longTip = dayTip + ' ' + hour + ':' + minute
	}

	if (de.getTime() >= beforeYesterday && de.getTime() < yesterday) {
		tip = '昨天 ' + hour + ':' + minute
		longTip = '昨天 ' + hour + ':' + minute
	}

	if (de.getTime() < beforeYesterday) {
		// + (hour) + ':' + minute
		tip = month + '月' + date + '日 ' + hour + ':' + minute
		longTip = month + '月' + date + '日 ' + hour + ':' + minute

		if (de.getTime() < lastYear) {
			// + (hour) + ':' + minute
			tip = year + '年' + month + '月' + date + '日 '
			longTip = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute
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
		minute
	mid = year + '年' + month + '月' + date + '日 ' + ' ' + hour + ':' + minute

	// 去年吗？
	if (de.getTime() < lastYear) {
	}
	shortDate = year + '年' + month + '月' + date + '日 星期' + week
	shortTime = hour + ':' + minute

	return {
		year,
		month,
		date,
		hour,
		minute,
		second,
		milli,
		week,
		UTC: Math.floor(UTC / 1000),
		tip,
		long,
		shortDate,
		shortTime,
		longTip,
		mid,
		newDate: new Date(UTC),
		birthday: year + '-' + month + '-' + date,
		birthdayCn: year + '年' + month + '月' + date + '日',
		monthOrDate: month + '-' + date,
		fullShortTime: hour + ':' + minute + ':' + second,
		time:
			year +
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
		cnTime:
			year +
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
	}
}

// 获取email富文本
function getMailContent(data: any): string {
	let bg: string = ''
	// var bg = 'https://api.aiiko.club/public/images/default_bg/bg-april.jpg'
	return (
		`
  <table class="tbl" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="width: 100%;position: relative;background-image: url('` +
		bg +
		`');background-size: cover;border-collapse: collapse;background-color: #ebedf0;font-family: 'Alright Sans LP', 'Avenir Next', 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Source Han Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi MicroHei', sans-serif;">
        <style>
            .tbl {}

            @media screen and (max-width: 767px) {
                .tbl {
                    background-image: url('` +
		bg +
		`');
                }
            }

            .sub-tb {}

            @keyframes animaMoveX {
                0% {
                    transform: translate(0, 0);
                }

                100% {
                    transform: translate(30px, 0);
                }
            }

            .tbl .td-main {}

            @media screen and (max-width: 767px) {

                .tbl .td-main {
                    padding: 40px 20px 0;
                }
            }

            .tbl .td-main {
              width: 100%;
            }
            .tbl .td-main  table{
              width: 100%;
            }

            .tbl .td-main img {
                max-width: 100%;
            }

            .tbl .td-main a {
                color: #e78771;
            }

            .tbl .link td {}

            .tbl .link td p {}

            .tbl .link td p a {}
        </style>
        <tbody class="tbl-body">
            <tr>
                <td>
                    <table class="sub-tb" cellpadding="0" cellspacing="0" align="center"
                        style="margin: 0 auto;width: 100%;max-width: 800px;padding: 0 15px;">
                        <tbody>
                            <tr>
                                <td style="height:20px;"></td>
                            </tr>
                            <tr>
                                <td height="10"></td>
                            </tr>
                            <tr>
                                <td height="40"></td>
                            </tr>
                            <tr>
                                <td class="td-main"
                                    style="background-color: rgb(255, 255, 255, 0.9);border-radius: 6px; padding: 40px 20px 0;font-size: 16px;margin: 0 auto;">
                                    <table>
                                        <tbody>
                                            <tr height="40">
                                                <td style="font-size:18px;font-family:'微软雅黑','黑体',arial;">
                                                    ` +
		data.title +
		`
                                                </td>
                                            </tr>
                                            <tr height="15">
                                                <td></td>
                                            </tr>
                                            <tr height="30" class="tr-main">
                                                <td>
                                                ` +
		data.html +
		`
                                                </td>

                                            </tr>
                                            <tr height="20">
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style="text-align:right;padding-left:55px;paddingfont-family:'微软雅黑','黑体',arial;font-size:14px;">
                                                    <br>
                                                    <span style="color:#555">` +
		(data.author || `爱喵日记馆`) +
		`</span>
                                                    <br>
                                                    <span style="color:#888">发件于 ` +
		data.time +
		`</span>
                                                </td>
                                            </tr>
                                            <tr height="50">
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:40px;"></td>
                            </tr>
                            <tr class="link">
                                <td style="text-align: center;color: #555;font-size: 12px;">
                                    <p style="line-height: 20px;">
                                        <span
                                            style=" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;">Copyright
                                            © 2019 - 2020</span>
                                        <a href="https://www.peacent.com/" target="_blank"
                                            style=" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;">拼说说官网</a>
                                    </p>
                                    <p style="line-height: 20px;">
                                        <a href="https://creation.peacent.com/"
                                            style=" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;"
                                            target="_blank">创作中心</a> -
                                        <a href="https://www.peacent.com/about" target="_blank"
                                            style=" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;">关于我们</a>
                                        -
                                        <a href="mailto:cat@peacent.com"
                                            style=" text-decoration: none;color: #555; padding: 0 5px;font-size: 16px;">开发者邮箱</a>
                                    </p>
                                    <!-- <p style="line-height: 20px;">
                                        <span style=" text-decoration: none;color: #555; padding: 0 0px;font-size: 16px;">如您不想再接受推送邮件了。可点我</span><a href="https://www.aiiko.club/app/setting"
                                        style=" text-decoration: none;color: #555;font-weight: 700; padding: 0 0px;font-size: 16px;"
                                        target="_blank">退订</a><span style=" text-decoration: none;color: #fff; padding: 0 0px;font-size: 16px;">推送</span>
                                    </p> -->
                                </td>
                            </tr>
                            <tr>
                                <td style="height:50px;"></td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    `
	)
}
