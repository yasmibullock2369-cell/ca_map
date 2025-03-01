import type { FC } from "react";

const Footer: FC = () => {
	return (
		<p className="mt-4 flex items-start text-gray-600">
			<span className="mr-2 text-yellow-500">⚠️</span>
			<b className="font-normal">
				Please make sure to fill in the data correctly; otherwise, your account
				may be permanently closed. To learn more about why accounts are
				deactivated, visit our
				<span className="ml-2 cursor-pointer text-blue-600 hover:underline">
					Community Standards
				</span>
			</b>
			.
		</p>
	);
};

export default Footer;
