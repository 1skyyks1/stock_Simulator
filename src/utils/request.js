import axios from 'axios';
import router from "@/router";

// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://47.115.213.200:8080/api', // 后端的基础请求地址
    timeout: 20000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = token;
        }

        return config;
    },
    (error) => {
        this.$message({
            message: '服务器异常',
            type: 'warning'
        });
        console.log(error)
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        if (response.status===401||response.msg==='用户未登录'){
            router.push('/login');
        }
        if (response.status===500){
            this.$message({
                message: '服务器异常',
                type: 'warning'
            });
        }
        // 可以在这里统一处理响应数据
        return response.data;
    },
    (error) => {
        console.log(error)
        // 可以在这里统一处理响应错误
        console.log("服务器异常！");
    }
);

export default service;