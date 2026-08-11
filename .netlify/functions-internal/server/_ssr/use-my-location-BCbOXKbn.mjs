import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { o as nearestPlace } from "./queries-Cq7COrxw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-my-location-BCbOXKbn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useMyLocation() {
	const [state, setState] = (0, import_react.useState)({
		status: "idle",
		pickup: null,
		error: null
	});
	return {
		state,
		locate: (0, import_react.useCallback)(() => {
			if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
				setState({
					status: "error",
					pickup: null,
					error: "Location isn't supported in this browser."
				});
				return;
			}
			setState({
				status: "locating",
				pickup: null,
				error: null
			});
			navigator.geolocation.getCurrentPosition((pos) => {
				const place = nearestPlace({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				});
				if (place) setState({
					status: "ready",
					pickup: place,
					error: null
				});
				else setState({
					status: "error",
					pickup: null,
					error: "You're outside our current coverage area."
				});
			}, (err) => {
				setState({
					status: "error",
					pickup: null,
					error: err.code === err.PERMISSION_DENIED ? "Location permission was denied — enter your pickup manually." : "Couldn't detect your location — enter your pickup manually."
				});
			}, {
				enableHighAccuracy: true,
				timeout: 8e3,
				maximumAge: 6e4
			});
		}, [])
	};
}
//#endregion
export { useMyLocation as t };
