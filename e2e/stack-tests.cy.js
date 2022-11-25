/// <reference types="cypress" />

const target = Cypress.env('TARGET') || 'https://im.dev.test.c.dhis2.org'
const IM_HOST = Cypress.env('HOST') || 'https://whoami.im.dev.test.c.dhis2.org'
const username = Cypress.env('USERNAME')
const password = Cypress.env('PASSWORD')

describe('stack tests', () => {
  beforeEach(() => {
    cy.visit(target)
    cy.get('#username').type(username)
    cy.get('#password').type(password,  { log: false })
    cy.wait(1000)
    cy.contains('Login').click()
    cy.wait(2000)
  })

  afterEach(() => {
    cy.contains('Logout').click()
  })

  it('whoami', () => {
    const name = 'cypress-whoami'
    cy.visit(`${target}/instances`)
    cy.wait(1000)
    cy.contains('New instance').click()
    cy.get('[data-test=dhis2-uicore-select-input]').click()
    cy.get('[data-value=whoami-go').click()
    cy.wait(1000)
    cy.get('div[data-test=dhis2-uiwidgets-inputfield-content] input:first').type(name)
    cy.contains('Create instance').click()

    cy.wait(5000)
    let url = `${IM_HOST}/${name}`
    cy.request(url)
    cy.wait(1000)
    // TODO: Dangerous!!!
    cy.contains(name).siblings().contains("Delete").click()
  })

  it('dhis2', () => {
    const name = 'cypress-dhis2'
    const databaseId = "1"
    cy.wait(1000)
    cy.visit(`${target}/instances`)
    cy.contains('New instance').click()
    cy.wait(1000)
    cy.get('div[data-test=dhis2-uiwidgets-inputfield-content] input:first').type(name)
    cy.get('#DATABASE_ID').type(databaseId)
    cy.contains('Create instance').click()

    cy.wait(10000)
//    let url = `${IM_HOST}/${name}`
//    cy.request(url)
    // TODO: Dangerous!!!
    cy.contains(name).siblings().contains("Delete").click()
  })

  it('dhis2-db', () => {
    const name = 'cypress-dhis2-db'
    const stack = "dhis2-db"
    const databaseId = "1"
    cy.wait(1000)
    cy.visit(`${target}/instances`)
    cy.contains('New instance').click()
    //cy.get('button[name=new]').click()
    cy.get('[data-test=dhis2-uicore-select-input]').click()
    cy.get(`[data-value=${stack}`).click()
    cy.wait(1000)
    cy.get('div[data-test=dhis2-uiwidgets-inputfield-content] input:first').type(name)
    cy.get('#DATABASE_ID').type(databaseId)
    cy.contains('Create instance').click()

    cy.wait(10000)
//    let url = `${IM_HOST}/${name}`
//    cy.request(url)
    // TODO: Dangerous!!!
    cy.contains(name).siblings().contains("Delete").click()
  })
})
