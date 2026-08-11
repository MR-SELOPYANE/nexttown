import type { AppNotification, NotificationKind, SosLog } from "../domain/types";
import { latency, loadJson, saveJson, storageKey, uid } from "./core";

const key = (userId: string) => storageKey("data", userId, "notifications");
const sosKey = (userId: string) => storageKey("data", userId, "sos");

function readNotes(userId: string): AppNotification[] {
  return loadJson<AppNotification[]>(key(userId), []);
}

export const NotificationService = {
  async mine(userId: string): Promise<AppNotification[]> {
    await latency(250);
    return readNotes(userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async push(
    userId: string,
    n: { title: string; body: string; kind: NotificationKind },
  ): Promise<AppNotification> {
    const note: AppNotification = { ...n, id: uid(), userId, read: false, createdAt: Date.now() };
    saveJson(key(userId), [note, ...readNotes(userId)].slice(0, 60));
    return note;
  },

  async markAllRead(userId: string): Promise<void> {
    await latency(120);
    saveJson(
      key(userId),
      readNotes(userId).map((n) => ({ ...n, read: true })),
    );
  },

  async clear(userId: string): Promise<void> {
    await latency(120);
    saveJson(key(userId), []);
  },

  async sos(userId: string, where: string): Promise<SosLog> {
    await latency(150);
    const entry: SosLog = { id: uid(), userId, at: Date.now(), where };
    const log = loadJson<SosLog[]>(sosKey(userId), []);
    saveJson(sosKey(userId), [entry, ...log]);
    return entry;
  },

  async sosLog(userId: string): Promise<SosLog[]> {
    await latency(150);
    return loadJson<SosLog[]>(sosKey(userId), []);
  },
};
