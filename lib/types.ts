export type Song = {
	id: string;
	filename: string;
	uri: string;
	duration?: number;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string | null;
};
