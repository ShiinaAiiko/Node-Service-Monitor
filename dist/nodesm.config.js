"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = exports.emailOption = exports.email = void 0;
// 后端服务心跳检测的配置文件
exports.email = [
    'shiina@aiiko.club',
    'koala@peacent.com',
    'bee@peacent.com',
    '1192567449@qq.com',
    'pssop@peacent.com',
];
exports.emailOption = {
    user: 'tech_service@peacent.com',
    pass: 'q9HA4TGYdA6VLAht',
    host: 'smtp.exmail.qq.com',
};
exports.service = [
    {
        name: 'Node-Master',
        platform: 'NodeJS',
        apis: [
            {
                method: 'GET',
                // url: 'http://localhost:8666/',
                // url: 'http://localhost:8666/pss/nodejs/v1',
                url: 'https://node.pinshuoshuo.xyz/pss/nodejs/v1',
                denyAllow: {
                    // 默认不允许404和500以上的通过
                    status: [200],
                },
            },
        ],
    },
    {
        name: 'Java-User',
        platform: 'Java',
        apis: [
            {
                method: 'GET',
                url: 'https://java.pinshuoshuo.xyz/user-server/userOpen/getGenderList',
                denyAllow: {
                    // 默认不允许404和500以上的通过
                    status: [401],
                },
            },
        ],
    },
    {
        name: 'Java-Content',
        platform: 'Java',
        apis: [
            {
                method: 'GET',
                url: 'https://java.pinshuoshuo.xyz/content-server/contentOpen/indexPageNoLogin',
                params: {
                    pageNum: 1,
                    pageSize: 1,
                },
                denyAllow: {
                    // 默认不允许404和500以上的通过
                    status: [401],
                },
            },
        ],
    },
    {
        name: 'Java-Message',
        platform: 'Java',
        apis: [
            {
                method: 'GET',
                url: 'https://java.pinshuoshuo.xyz/message-server/rollSearchOpen/list',
                params: {},
                denyAllow: {
                    // 默认不允许404和500以上的通过
                    status: [401],
                },
            },
        ],
    },
    {
        name: 'Java-Mall',
        platform: 'Java',
        apis: [
            {
                method: 'POST',
                url: 'https://java.pinshuoshuo.xyz/mall-server/payApp/tradeQuery',
                data: {},
                denyAllow: {
                    // 默认不允许404和500以上的通过
                    status: [],
                },
                allow: {
                    // 默认不允许404和500以上的通过
                    status: [401],
                },
            },
        ],
    },
];
