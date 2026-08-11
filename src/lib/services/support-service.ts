import type { SupportTicket } from "../domain/types";
import { latency, loadJson, saveJson, storageKey, uid } from "./core";

const KEY = storageKey("db", "support-tickets");

function readAll(): SupportTicket[] {
  return loadJson<SupportTicket[]>(KEY, []);
}

export const SupportService = {
  async submit(input: {
    topic: string;
    subject: string;
    message: string;
    email?: string;
    userId?: string;
  }): Promise<SupportTicket> {
    await latency(600);
    const ticket: SupportTicket = {
      id: uid(),
      userId: input.userId,
      topic: input.topic,
      subject: input.subject,
      message: input.message,
      status: "open",
      createdAt: Date.now(),
    };
    saveJson(KEY, [ticket, ...readAll()]);
    return ticket;
  },

  async mine(userId: string): Promise<SupportTicket[]> {
    await latency(250);
    return readAll()
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async all(): Promise<SupportTicket[]> {
    await latency(250);
    return readAll().sort((a, b) => b.createdAt - a.createdAt);
  },

  async resolve(id: string): Promise<void> {
    await latency(200);
    saveJson(
      KEY,
      readAll().map((t) => (t.id === id ? { ...t, status: "resolved" as const } : t)),
    );
  },
};
