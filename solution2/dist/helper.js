import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
/**
 * Get owner of an Item
 */
export async function findUniqueItemsOrThrow(item) {
    if (item.ownerType === "Book") {
        return await prisma.book.findUniqueOrThrow({ where: { id: item.ownerId } });
    }
    if (item.ownerType === "Movie") {
        return await prisma.movie.findUniqueOrThrow({
            where: { id: item.ownerId },
        });
    }
    throw new Error("Invalid item type.");
}
/**
 * Get all book items or all movie items
 */
export async function findManyItem(ownerId) {
    return prisma.item.findMany({ where: { ownerId } });
}
