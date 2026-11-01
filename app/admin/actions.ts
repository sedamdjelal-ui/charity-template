"use server";

import { updateTag } from "next/cache";

export async function refreshSettings() {
  updateTag("settings");
}