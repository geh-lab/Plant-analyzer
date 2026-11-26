import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

import { applyDisplay, readDisplay } from "@/utils/appearance";

applyDisplay(readDisplay());
createRoot(document.getElementById("root")).render(<App/>);
