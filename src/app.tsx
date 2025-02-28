import "@/assets/style/styles.css";
import Layout from "@/components/layout";
import Index from "@/pages";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Upload from "@/pages/upload";
import Verify from "@/pages/verify";
import { Route, Routes } from "react-router";

const App = () => {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Index />} />
				<Route path="/home" element={<Home />} />
				<Route path="/verify" element={<Verify />} />
				<Route path="/upload" element={<Upload />} />
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
};

export default App;
