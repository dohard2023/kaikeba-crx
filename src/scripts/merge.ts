import fs from 'fs';
import path from 'path';
import { IMenus, IResourceItem } from '../inetrface';

export function get_menus(p: string, ret: IResourceItem[] = [] as IResourceItem[]): IResourceItem[] {
	return fs.readdirSync(p).reduce((_ret, element) => {
		const _path = path.join(p, element);
		if (fs.statSync(_path).isDirectory()) {
			get_menus(_path, []).forEach((j) => {
				_ret.push(j)
			})
		} else {
			const _txt = fs.readFileSync(_path, {
				encoding: 'utf-8'
			})
			if (_txt) {
				const txt = JSON.parse(_txt) as IResourceItem;
				_ret.push({
					...txt,
					filepath: _path
				})
			}
		}
		return _ret
	}, ret);
}

const menus = get_menus(path.join(__dirname, '../../course'));

const res = {} as IMenus
menus.every((item) => {
	if (item.id && item.fragments.every((i) => {
		return JSON.stringify(Object.keys(i)) === JSON.stringify(['title', 'timestamp'])
	})) {
		if (res[item.id]) {
			throw new Error(`${item.filepath} 文件id:${item.id}重复！`);
		} else {
			return res[item.id] = item.fragments
		}
	} else {
		throw new Error(`${item.filepath} 文件不符合规范！`);
	}
})

fs.writeFileSync(path.join(__dirname, '../../main.json'), JSON.stringify(res, null, '\t'))


