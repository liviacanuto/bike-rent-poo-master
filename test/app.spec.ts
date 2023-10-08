import sinon from "sinon"
import { App } from "../src/app"
import { Bike } from "../src/bike"
import { User } from "../src/user"
import { Location } from "../src/location"
import { BikeNotFoundError } from "../src/errors/bike-not-found-error"
import { UnavailableBikeError } from "../src/errors/unavailable-bike-error"
import { UserNotFoundError } from "../src/errors/user-not-found-error"
import { DuplicateUserError } from "../src/errors/duplicate-user-error"
import { FakeUserRepo } from "./doubles/fake-user-repo"
import { FakeBikeRepo } from "./doubles/fake-bike-repo"
import { FakeRentRepo } from "./doubles/fake-rent-repo"
import { UserRepo } from "../src/ports/user-repo"
import { BikeRepo } from "../src/ports/bike-repo"
import { RentRepo } from "../src/ports/rent-repo"
import { UserWithOpenRentError } from "../src/errors/user-with-open-rent"


let userRepo: UserRepo
let bikeRepo: BikeRepo
let rentRepo: RentRepo

describe('App', () => {
    beforeEach(() => {
        userRepo = new FakeUserRepo()
        bikeRepo = new FakeBikeRepo()
        rentRepo = new FakeRentRepo()
    })

    it('returnBike() - should correctly calculate the rent amount', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        await app.registerBike(bike)
        const clock = sinon.useFakeTimers();
        await app.rentBike(bike.id, user.email)
        const hour = 1000 * 60 * 60
        clock.tick(2 * hour)
        const rentAmount = await app.returnBike(bike.id, user.email)
        expect(rentAmount).toEqual(200.0)
    })

    it('moveBikeTo() - should be able to move a bike to a specific location', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        await app.registerBike(bike)
        const newYork = new Location(40.753056, -73.983056)
        await app.moveBikeTo(bike.id, newYork)
        expect(bike.location.latitude).toEqual(newYork.latitude)
        expect(bike.location.longitude).toEqual(newYork.longitude)
    })

    it('moveBikeTo() - should throw an exception when trying to move an unregistered bike', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const newYork = new Location(40.753056, -73.983056)
        await expect(app.moveBikeTo('fake-id', newYork)).rejects.toThrow(BikeNotFoundError)
    })

    it('rentBike() - should correctly handle a bike rent', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        await app.registerBike(bike)
        await app.rentBike(bike.id, user.email)
        const appRentRepo = (app.rentRepo as FakeRentRepo)
        expect(appRentRepo.rents.length).toEqual(1)
        expect(appRentRepo.rents[0].bike.id).toEqual(bike.id)
        expect(appRentRepo.rents[0].user.email).toEqual(user.email)
        expect(bike.available).toBeFalsy()
    })

    it('rentBike() - should throw unavailable bike when trying to rent with an unavailable bike', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        await app.registerBike(bike)
        await app.rentBike(bike.id, user.email)
        await expect(app.rentBike(bike.id, user.email))
            .rejects.toThrow(UnavailableBikeError)
    })

    it('findUser() - should throw user not found error when user is not found', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        await expect(app.findUser('fake@mail.com'))
            .rejects.toThrow(UserNotFoundError)
    })

    it('authenticate() - should correctly authenticate user', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        await expect(app.authenticate('jose@mail.com', '1234'))
            .resolves.toBeTruthy()
    })

    it('registerUser() - should throw duplicate user error when trying to register a duplicate user', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        await expect(app.registerUser(user)).rejects.toThrow(DuplicateUserError)
    })

    it('removeUser() - should throw user not found error when trying to remove an unregistered user', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        await expect(app.removeUser('fake@mail.com'))
            .rejects.toThrow(UserNotFoundError)
    })

    it('removeUser() - should correctly remove registered user', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        await app.removeUser(user.email)
        await expect(app.findUser(user.email))
            .rejects.toThrow(UserNotFoundError)
    })

    it('registerUser() - should correctly register user', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        await expect(app.findUser(user.email))
            .resolves.toEqual(user)
    })


    it('removeUser() - should throw an error when try remove a registered user with open rent', async () => {
        const app = new App(userRepo, bikeRepo, rentRepo)
        const user = new User('jose', 'jose@mail.com', '1234')
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        await app.registerBike(bike)
        await app.registerUser(user)
        await app.rentBike(bike.id, user.email)

        await expect(app.removeUser(user.email))
            .rejects.toThrow(UserWithOpenRentError)
    })
})