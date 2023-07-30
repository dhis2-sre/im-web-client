/// <reference types="cypress" />

import { password, target, username } from './env'

export const login = () => {
    cy.visit(target)
    cy.get('#username').type(username)
    cy.get('#password').type(password, { log: false })
    cy.contains('Login').click()
}

export const logout = () => cy.contains('Logout').click()
