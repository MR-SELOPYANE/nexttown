import type { FavouriteDestination } from "../domain/types";
import { latency, loadJson, saveJson, storageKey, uid } from "./core";

const key = (userId: string) => storageKey("data", userId, "favourites");

export const FavouriteService = {
  async list(userId: string): Promise<FavouriteDestination[]> {
    await latency(220);
    return loadJson<FavouriteDestination[]>(key(userId), []).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  },

  async add(userId: string, input: { label: string; from: string; to: string }): Promise<FavouriteDestination> {
    await latency(300);
    const all = loadJson<FavouriteDestination[]>(key(userId), []);
    if (
      all.some(
        (f) => f.from.toLowerCase() === input.from.toLowerCase() && f.to.toLowerCase() === input.to.toLowerCase(),
      )
    ) {
      throw new Error("This route is already in your favourites.");
    }
    const favourite: FavouriteDestination = {
      id: uid(),
      userId,
      label: input.label,
      from: input.from,
      to: input.to,
      createdAt: Date.now(),
    };
    saveJson(key(userId), [favourite, ...all]);
    return favourite;
  },

  async remove(userId: string, id: string): Promise<void> {
    await latency(200);
    saveJson(
      key(userId),
      loadJson<FavouriteDestination[]>(key(userId), []).filter((f) => f.id !== id),
    );
  },
};
