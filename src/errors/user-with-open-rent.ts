export class UserWithOpenRentError extends Error {
    public readonly name = 'UserWithOpenRentError'

    constructor() {
        super('User With Open Rent.')
    }
}