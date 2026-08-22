"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveGroupImage, deleteGroupImage } from "@/lib/uploads";

export async function uploadGroupImage(groupId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Keine Datei übermittelt");
  }

  const { filePath, width, height } = await saveGroupImage(file, groupId);
  const image = await prisma.groupImage.create({
    data: { groupId, filePath, width, height },
  });

  const group = await prisma.shotGroup.findUniqueOrThrow({ where: { id: groupId } });
  revalidatePath(`/sessions/${group.sessionId}`);
  return image;
}

export async function deleteGroupImageAction(imageId: string) {
  const image = await prisma.groupImage.findUniqueOrThrow({ where: { id: imageId } });
  await deleteGroupImage(image.filePath);
  await prisma.groupImage.delete({ where: { id: imageId } });

  const group = await prisma.shotGroup.findUnique({ where: { id: image.groupId } });
  if (group) revalidatePath(`/sessions/${group.sessionId}`);
}
