export interface IFragment {
	title: string;
	timestamp: number;
}

export interface IMenus {
	[id: string]: IFragment[];
}

export interface IResourceItem {
	id: string,
	filepath?: string;
	fragments: IFragment[]
}