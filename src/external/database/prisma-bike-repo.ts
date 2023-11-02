import { Bike } from "../../bike";
import { BikeRepo } from "../../ports/bike-repo";
import prisma from "./db";

export class PrismaBikeRepo implements BikeRepo {
    async find(id: string): Promise<Bike> {
        return await prisma.bike.findFirst({
            where: { id },
        });
    }
    async add(bike: Bike): Promise<string> {
        const addedBike = await prisma.bike.create({
            data: {
                name: bike.name,
                type: bike.type,
                bodySize: bike.bodySize,
                maxLoad: bike.maxLoad,
                rate: bike.rate,
                description: bike.description,
                ratings: bike.ratings,
                available: bike.available,
                latitude: bike.location.latitude,
                longitude: bike.location.longitude,
                imageUrls: bike.imageUrls,
            },
        });
        return addedBike.id;
    }
    async remove(id: string): Promise<void> {
        await prisma.bike.delete({
            where: { id },
        });
    }
    async update(id: string, bike: Bike): Promise<void> {
        await prisma.bike.update({
            where: { id },
            data: {
                name: bike.name,
                type: bike.type,
                bodySize: bike.bodySize,
                maxLoad: bike.maxLoad,
                rate: bike.rate,
                description: bike.description,
                ratings: bike.ratings,
                available: bike.available,
                latitude: bike.location.latitude,
                longitude: bike.location.longitude,
                imageUrls: bike.imageUrls,
            },
        });
    }
    async list(): Promise<Bike[]> {
        return await prisma.bike.findMany({});
    }
}
