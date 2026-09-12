import { createServerFn } from "@tanstack/react-start";

import {
  createDispatch,
  getDispatch,
  respondDispatch,
  validateDispatchInput,
  type DispatchServiceResult,
} from "./server/dispatch-service";

// Register pickup zone server functions
export * from "./pickup-zone-functions";

/**
 * DISPATCH SERVER FUNCTIONS
 * --------------------------------------------------------------------------
 * The only client-reachable surface of the server-authoritative dispatch
 * layer. Each export is a TanStack Start server function: on the server it
 * runs the real implementation (validation -> pool fetch -> match -> atomic
 * claim), on the client the compiler replaces it with an RPC fetcher.
 *
 * Callers NEVER make assignment decisions — the server decides everything
 * and simply returns the resulting dispatch row + offered driver.
 */

export const createDispatchFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }): Promise<DispatchServiceResult> => {
    const input = validateDispatchInput(data ?? {});
    if (!input) {
      return {
        ok: false,
        code: "invalid_input",
        message: "Invalid dispatch request (missing pickup/dropoff, class, or seats)",
      };
    }
    try {
      return await createDispatch(input);
    } catch (error) {
      console.error("createDispatch failed", error);
      return { ok: false, code: "service_error", message: "Could not create the dispatch" };
    }
  });

export type RespondDispatchPayload = {
  dispatchId: string;
  driverId: string;
  response: "accepted" | "rejected" | "timeout";
};

export const respondDispatchFn = createServerFn({ method: "POST" })
  .validator((data: RespondDispatchPayload) => data)
  .handler(async ({ data }): Promise<DispatchServiceResult> => {
    if (
      !data ||
      typeof data.dispatchId !== "string" ||
      typeof data.driverId !== "string" ||
      !["accepted", "rejected", "timeout"].includes(data.response)
    ) {
      return {
        ok: false,
        code: "invalid_input",
        message: "Expected { dispatchId, driverId, response: accepted|rejected|timeout }",
      };
    }
    try {
      return await respondDispatch(data.dispatchId, data.driverId, data.response);
    } catch (error) {
      console.error("respondDispatch failed", error);
      return { ok: false, code: "service_error", message: "Could not update the dispatch" };
    }
  });

export type GetDispatchPayload = {
  dispatchId: string;
};

export const getDispatchFn = createServerFn({ method: "POST" })
  .validator((data: GetDispatchPayload) => data)
  .handler(async ({ data }) => {
    if (!data || typeof data.dispatchId !== "string" || !data.dispatchId) {
      return { dispatch: null };
    }
    try {
      return { dispatch: await getDispatch(data.dispatchId) };
    } catch (error) {
      console.error("getDispatch failed", error);
      return { dispatch: null };
    }
  });
