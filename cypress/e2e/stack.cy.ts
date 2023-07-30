/// <reference types="cypress" />

import { login, logout } from './utils'

describe('stack tests', () => {
    beforeEach(login)
    afterEach(logout)

    it('stacks', () => {
        cy.contains('Stacks').click()
        cy.contains('whoami-go').click()
        cy.contains('Stacks').click()
        cy.contains('dhis2').click()
    })
})
