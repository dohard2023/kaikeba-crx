/**
 * TODO 接口本来是从interface.ts里导入的
 * import { IMenus } from '../inetrface';
 *
 * 但是这样写，导致编译生成的js末尾会多一行 export {};
 * 会引起浏览器的报错
 *
 * 目前还没有较好的解决方法
 * https://github.com/microsoft/TypeScript/issues/41513
 */
interface IFragment {
	title: string;
	timestamp: number;
	/**
	 * 用户手动添加
	 */
	manual?: boolean
}

interface IMenus {
	[id: string]: IFragment[];
}

const POLLING_TIME = 60 * 60 * 1000; // 一小时
const SOURCE_URL = `https://cdn.jsdelivr.net/gh/MaShizhen/kaikeba-crx/main.json`;
const VIDEO_SELECTOR = '#__hky-video__v1001_html5_api'; // 视频播放器
const VODFRAG_SELECTOR = '.PlayVodFrag'; // 片段容器
const VODFRAG_BOX_SELECTOR = '.play-vodfrag-box'; // 片段容器
const VODFRAG_LIST_SELECTOR = '.play-vodfrag-list'; // 片段列表
const PLAYVODFRAG_IMG_SELECTOR = '.play-vodfrag-img'; // 片段容器图片

/**
 * DOM 节点
 */
let video = null as HTMLVideoElement; // 视频播放器
let vodfrag = null as HTMLDivElement; // 片段容器
let vodfrag_box = null as HTMLDivElement; // 片段列表
let vodfrag_list = null as HTMLDivElement; // 片段列表
let vodfrag_list_img = null as HTMLDivElement; // 片段容器图片

/**
 * 获取主要的两个节点
 */
const await_elements = <T1, T2 = HTMLDivElement, T3 = HTMLDivElement, T4 = HTMLDivElement, T5 = HTMLDivElement>(...selector: string[]) => {
	return new Promise<[T1, T2, T3, T4, T5]>((resolve) => {
		const ret = selector.filter((i) => {
			return document.querySelector(i);
		}).map((j) => {
			return document.querySelector(j);
		}) as unknown as [T1, T2, T3, T4, T5]
		if (ret.length === selector.length) {
			resolve(ret);
		} else {
			setTimeout(async () => {
				resolve(await await_elements(...selector));
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
	Array.from(vodfrag_list.childNodes).forEach((node) => {
		vodfrag_list.removeChild(node);
	});
};

const get_id = () => {
	return window.location.href.match(/([^\/]+)$/)[0];
}

/**
 * 设置片段列表
 * @param {*} menus 配置的片段数据
 */
const render_menus = (menus: IMenus) => {
	const id = get_id();
	// 获取到片段
	const fragments = menus[id];
	if (fragments) {
		// 处理片段
		// 1. 服务器新增 & 本地新增
		const ret = merge(id, fragments)
		exec_render(id, ret)
	} else {
		return new Error('没有找到该视频的片段信息');
	}
};

const exec_render = (id: string, fragments: IFragment[]) => {
	clear_menus();

	fragments.forEach((item, index) => {
		const li = document.createElement('li');
		li.setAttribute(vodfrag_list.attributes[0].name, '');
		li.style.display = 'flex';
		li.style.justifyContent = 'space-between';

		if (item.manual) {
			const del = document.createElement('img');
			del.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABK0lEQVQ4T72SsUoDURBF73248SfcBUHILva20Y/QVquQTqIfYGwsRES0EKwUKxErU9lEv2LXRuTpT7gr78pbSDAxWcIWTjkz98zc94aYEVkYdETuU3CEHp3UTz6/nyfbOU3/Gi52RZ0SvPJ1QW2Au7H9Op8LkIXBgOS7c+7GC4wx2wBWmzZf+wMYTptlpSpPca+0kEaNHqVWuS758ltkADlgzCqBAwGHic17o4Jf2wvjj2Kjamq6tLBOYwaxzUvtVEAaBe3EFuUDpmGwk3wU18PcXIAsasivWE6gWhSfBBz5qbUAgulTOqkNIMyDpIvaADjcgbz8P0DtXyAZNm2+UnUHWdQ4BrAZ23x58g463ieAWwFvsyD+CgGdxbbojgFGJ102VMZ9bPOtYccPM0fRf+Rq2ygAAAAASUVORK5CYII=')
			const todel = (e: Event) => {
				e.stopPropagation();
				const res = confirm('确认删除 ?')
				if (res) {
					const f = get(id) as IFragment[]
					f.splice(index, 1)
					set(id, f)
					// del.removeEventListener('click', todel, false)
					li.remove()
				}
			}
			del.addEventListener('click', todel)

			const text = document.createElement('span');
			text.innerText = item.title

			li.appendChild(text)
			li.appendChild(del)
		} else {
			li.innerText = item.title;
		}

		li.addEventListener('click', () => {
			Array.from(vodfrag_list.childNodes).forEach((node: HTMLDivElement) => {
				node.removeAttribute('class');
			});
			li.setAttribute('class', 'active');
			video.currentTime = item.timestamp;
			video.play()
		});
		// 插入片段项
		vodfrag_list.appendChild(li);
	});
}

const insert_add_btn = () => {
	const id = get_id();

	const node = vodfrag_list_img.cloneNode(true) as HTMLDivElement
	node.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAeElEQVQ4T9WTuw2EQAxE33DtkBGRcxmd0ArNECJSqOCka2fQog35aTcBp7afxqOxyCyd7dtuAEmajuauADPwkVSnAhwWg4RUwBAVtA8H2K6AfkdmGSwAfju9TtJ/MycbcGSQ7beYeHJCdpAWoMiJ8jcCxqQk3vn0FbS2PBFMnkT+AAAAAElFTkSuQmCC)`
	node.style.paddingLeft = '5px'
	node.style.cursor = 'pointer'
	node.setAttribute('crx-btn', 'add')

	node.addEventListener('click', () => {
		const timestamp = video.currentTime
		const title = prompt(`把当前播放位置: ${timestamp}, 添加至片段列表`, '请输入片段标题')
		if (title) {
			const ret = merge(id, [{
				title,
				timestamp,
				manual: true
			}])
			exec_render(id, ret)
			insert_share_btn()
		}
	})

	vodfrag.appendChild(node)
}

const insert_share_btn = () => {
	if (document.querySelector('[crx-btn="share"]')) {
		return
	}
	const id = get_id();

	const node = vodfrag_list_img.cloneNode(true) as HTMLDivElement
	node.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3UlEQVQ4T62TIU4DURRFzwkLwGBAoRq2gGMdCBwpihZD2AECNkFwaBJsF1DTHdRAgiimQHCX/GSGNKHDzKQ8+9877/9775cNy67zSfaBI+BVfarn+gCmwBJYAJ/qSYH0AUQ1yR4wUQedAUmugGvgvlr6po5aAUmOgRtgBpwDB8C7OvmlQZIH4BD4Ak6BW2AbuFAfm8T+0SDJMzCuGgvsUi3b/6x/BWz2hHX3bBBxp7Jx3upCDV2x8Q7YAj7Us86A0pikDtIu8FJC1RewGuWFOuwLqD/TfG2Q2vxuOv8Gbs9cESDy0AoAAAAASUVORK5CYII=)`
	node.style.paddingLeft = '5px'
	node.style.cursor = 'pointer'
	node.setAttribute('crx-btn', 'share')

	node.addEventListener('click', () => {

		chrome.runtime.sendMessage({ type: 'launch', text: JSON.stringify(get(id), null, '\t') }, (res) => {
			if (res) {
				const ret = confirm(`已经把片段数据复制到剪切板，即将跳转GitHub。欢迎提交PR ~`)
				if (ret) {
					jump_github()
				}
			} else {
				const ret = confirm(`请手动复制片段数据。即将跳转GitHub。欢迎提交PR ~`)
				if (ret) {
					jump_github()
				}
			}

		});
	})

	vodfrag.style.width = '120px'
	vodfrag.appendChild(node)
}

const jump_github = () => {
	window.open(`https://github.com/MaShizhen/kaikeba-crx/pulls`)
}

function get(key: string) {
	const res = localStorage.getItem(key)
	try {
		return JSON.parse(res)
	} catch (error) {
		return res
	}
}

function set(key: string, value: object) {
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		localStorage.setItem(key, value.toString())
	}
}

const merge = (id: string, data: IFragment[]) => {
	const old = get(id) || []

	const s = new Set()
	const ret = [...data, ...old].filter((i) => {
		return s.has(i.timestamp) ? false : s.add(i.timestamp)
	}).sort((j, k) => {
		if (j.manual) {
			insert_share_btn()
		}
		return j.timestamp - k.timestamp
	})
	set(id, ret)
	return ret
}

const change_box_style = () => {
	vodfrag_box.style.width = '500px';
	(vodfrag_box.firstChild as HTMLDivElement).style.left = '230px'
}

window.onload = async () => {

	// 等待节点加载就绪
	[video, vodfrag, vodfrag_box, vodfrag_list, vodfrag_list_img] = await await_elements<HTMLVideoElement>(VIDEO_SELECTOR, VODFRAG_SELECTOR, VODFRAG_BOX_SELECTOR, VODFRAG_LIST_SELECTOR, PLAYVODFRAG_IMG_SELECTOR);

	change_box_style()

	// 增加操作按钮
	insert_add_btn()

	// 请求片段数据
	const refresh = async () => {
		try {
			const ret = await request(SOURCE_URL);
			render_menus(JSON.parse(ret));
		} catch (error) {
			alert(error.msg);
		}
	};
	refresh();
	setInterval(refresh, POLLING_TIME);
};



