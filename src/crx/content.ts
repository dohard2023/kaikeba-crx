import { IMenus } from '../inetrface';

const POLLING_TIME = 60 * 60 * 1000; // 一小时

const SOURCE_URL = `https://cdn.jsdelivr.net/gh/MaShizhen/kaikeba-crx/videos/test.json`;

let video = null as HTMLVideoElement;
let menus_container = null as HTMLDivElement;

/**
 * 获取主要的两个节点
 */
const get_elements = () => {
	return new Promise<{ video: HTMLVideoElement, menus_container: HTMLDivElement }>((resolve) => {
		const _video = document.querySelector<HTMLVideoElement>('#__hky-video__v1001_html5_api');
		const _menus_container = document.querySelector<HTMLDivElement>('.play-vodfrag-list');
		if (_video && _menus_container) {
			resolve({ video: _video, menus_container: _menus_container });
		} else {
			setTimeout(() => {
				resolve(get_elements());
			}, 300);
		}
	});
};

/**
 * 用于请求片段数据
 */
const request = (url: string) => {
	return new Promise<string>((resolve, reject) => {
		fetch(url)
			.then((res) => res.text())
			.then((data) => {
				resolve(data);
			}).catch((err) => {
				reject(err);
			});
	});
};

/**
 * 清空片段列表
 */
const clear_menus = () => {
	Array.from(menus_container.childNodes).forEach((node) => {
		menus_container.removeChild(node);
	});
};

/**
 * 设置片段列表
 * @param {*} menus 配置的片段数据
 */
const render_menus = (menus: IMenus) => {
	clear_menus();

	const id = window.location.href.match(/([^\/]+)$/)[0];
	const current_menus = menus[id];
	if (current_menus) {
		current_menus.forEach((item) => {
			const li = document.createElement('li');
			li.setAttribute(menus_container.attributes[0].name, '');
			li.innerText = item.title;
			li.addEventListener('click', () => {
				Array.from(menus_container.childNodes).forEach((node: HTMLDivElement) => {
					node.removeAttribute('class');
				});
				li.setAttribute('class', 'active');
				video.currentTime = item.timestamp;
			});
			// 插入片段项
			menus_container.appendChild(li);
		});
	} else {
		return new Error('没有找到该视频的片段信息');
	}
};

window.onload = async () => {

	const eles = await get_elements();
	video = eles.video;
	menus_container = eles.menus_container;

	const refresh = async () => {
		try {
			const ret = await request(SOURCE_URL);
			console.log(ret);

			render_menus(JSON.parse(ret));
		} catch (error) {
			alert(error.msg);
		}
	};
	refresh();
	setInterval(refresh, POLLING_TIME);
};



