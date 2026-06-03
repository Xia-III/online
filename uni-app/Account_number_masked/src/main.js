import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import { requestInterceptor, responseInterceptor } from './utils/interceptor.js';

// 注册拦截器
requestInterceptor;
responseInterceptor;

export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
