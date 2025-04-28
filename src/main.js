import {
	createSSRApp
} from "vue";
import App from "./App.vue";

// 导入 uni-ui 组件
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export function createApp() {
	const app = createSSRApp(App);
	
	// 注册组件
	app.component('uni-icons', uniIcons);
	
	return {
		app,
	};
}
