import request from 'supertest'
import server from '../src/server'
import prisma from '../src/external/database/db'
import { Bike } from '../src/bike'
import { Location } from "../src/location";

describe('Register user route', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany({})
    })

    afterAll(async () => {
        await prisma.user.deleteMany({})
    })

    it('registers a bike with valid data', async () => {
        const bike = new Bike('bicicleta', 'verde', 5, 15, 100.0,'description', 10, [], true, new Location(1,1))

        await request(server)
            .post('/api/bikes')
            .send(bike)
            .expect(201)
            .then((res) => {
                expect(res.body.id).toBeDefined()
            })
    }, 20000)
})