import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as PageShell } from "./page-shell-VfhkVXqe.mjs";
import { n as RequireAuth } from "./require-auth-DX6ZGA79.mjs";
import { t as RideNowFlow } from "./ride-now-flow-D4TjGSnM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ride-C-K3ucuf.js
var import_jsx_runtime = require_jsx_runtime();
function RideNowPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, {
		showCompliance: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RideNowFlow, {})
	}) });
}
//#endregion
export { RideNowPage as component };
