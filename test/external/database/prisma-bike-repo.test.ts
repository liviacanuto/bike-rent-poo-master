import { PrismaUserRepo } from "../../../src/external/database/prisma-user-repo";
import prisma from "../../../src/external/database/db";
import { Bike } from "../../../src/bike";
import { PrismaBikeRepo } from "../../../src/external/database/prisma-bike-repo";

describe("PrimsBikeRepo", () => {
    beforeEach(async () => {
        await prisma.bike.deleteMany({})
    })

    afterAll(async () => {
        await prisma.bike.deleteMany({})
    })

    it("adds a bike in the database", async () => {
        const bikeToBePersisted = new Bike(
            "bikeTeste",
            "testeType",
            5,
            10,
            8,
            "description nice",
            7,
            []
        );
        const repo = new PrismaBikeRepo();
        const bikeId = await repo.add(bikeToBePersisted);
        expect(bikeId).toBeDefined();
        const persistedBike = await repo.find(bikeToBePersisted.id);
        expect(persistedBike.name).toEqual(bikeToBePersisted.name);
    });

    it("removes a bike from the database", async () => {
        const bikeToBePersisted = new Bike(
            "bikeTeste",
            "testeType",
            5,
            10,
            8,
            "description nice",
            7,
            []
        );
        const repo = new PrismaBikeRepo();
        const bikeId = await repo.add(bikeToBePersisted);
        await repo.remove(bikeId);
        const removedBike = await repo.find(bikeId);
        expect(removedBike).toBeNull();
    });

    it("lists bike in the database", async () => {
        const bike1 = new Bike(
            "bike1",
            "vermelho",
            8,
            5,
            9,
            "blabla",
            7,
            []
        );
        const bike2 = new Bike(
            "bike2",
            "verde",
            4,
            6,
            8,
            "pipipopo",
            8,
            []
        );
        const repo = new PrismaBikeRepo();
        await repo.add(bike1);
        await repo.add(bike2);
        const bikeList = await repo.list();
        expect(bikeList.length).toEqual(2);
    });

    it("update bike in the database", async () => {
        const bike1 = new Bike(
            "bike1",
            "vermelho",
            8,
            5,
            9,
            "blabla",
            7,
            []
        );
        const bike2 = new Bike(
            "bike2",
            "verde",
            4,
            6,
            8,
            "pipipopo",
            8,
            []
        );
        const repo = new PrismaBikeRepo();
        const bikeId = await repo.add(bike1);
        await repo.update(bikeId, bike2);
        expect(bikeId).toBeDefined();
        const updatedBike = await repo.find(bikeId);
        expect(updatedBike.name).toEqual(bike2.name);
    });
});
