/// <reference types="cypress" />

import { login, logout } from './utils'

describe('database tests', () => {
    beforeEach(login)
    afterEach(logout)

    it('databases', () => {
        cy.contains('Databases').click()
    })
})
