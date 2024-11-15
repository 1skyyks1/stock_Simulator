import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import '@/assets/font/font.css'

import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(elementUI);

Vue.config.productionTip = false

Vue.config.errorHandler = function (err, vm, info) {
  // 1. 记录错误日志到服务器（可选）
  console.error('捕获到全局错误:', err);
  console.error('错误发生的组件实例:', vm);
  console.error('错误信息:', info);

  // 2. 显示友好的错误提示
  // Vue.prototype.$message.error('系统错误，请稍后再试');

  // 3. 可以选择是否将错误信息发送到监控平台，例如 Sentry 等
  // 示例:
  // Sentry.captureException(err);
};

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
