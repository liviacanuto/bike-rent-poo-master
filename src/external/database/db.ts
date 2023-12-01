import { PrismaClient } from "@prisma/client";

if (!global.prisma) {
    global.prisma = new PrismaClient({
        log: ['info'],
    })
}
export default global.prisma;