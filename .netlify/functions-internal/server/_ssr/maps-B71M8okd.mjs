import { S as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maps-B71M8okd.js
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ height }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full animate-pulse bg-white/5 border-b border-white/10",
		style: { height },
		"aria-hidden": true
	});
}
function LiveMap(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { height: props.height ?? 320 }) });
}
//#endregion
export { LiveMap as t };
