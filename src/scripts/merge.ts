import fs from 'fs';
import path from 'path';
import { IMenus } from '../inetrface';

export function readDirSync(p: string, ret: IMenus[] = [] as IMenus[]): IMenus[] {
	return fs.readdirSync(p).reduce((_ret, element) => {
		const _path = path.join(p, element);

		if (fs.statSync(_path).isDirectory()) {
			return [...ret, ...readDirSync(_path, ret)];
		} else {
			const txt = JSON.parse(fs.readFileSync(_path, {
				encoding: 'utf-8'
			})) as IMenus;
			_ret.push(txt)
		}
		return _ret
	}, ret);
}

console.log(__dirname, path.join(__dirname, '../../videos'));


const res = readDirSync(path.join(__dirname, '../../videos'));
console.log(JSON.stringify(res));


