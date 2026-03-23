
describe('Home',{ execTimeout: 100000 }, () => {
  const worldName = '___New world___';
  const viewName = 'New view';
  const dbName = 'cypress-db-test';
  const winpty = Cypress.platform === 'win32' ? 'winpty' : ''

  beforeEach(() => {
    cy.visit('/?test')
   })

  context('Start and clean worlds', () => {
    it('should display world test', () => {
      cy.get('#worlds').should('contain', worldName)
    });

    it('Remove view', () => {
      cy.get('.world ').each($el => {
        console.log($el[0].innerText, worldName)
        if ($el[0].innerText.includes(worldName)) {
          cy.get(':nth-child(1) > .world-footer > #delete-world').click({force: true})
          cy.wait(1000)
          cy.get('.vue-dialog-buttons > :last').click()
        }
      })
      //.vue-dialog-buttons > :nth-child(2)
    });

    it('Remove world', () => {

      cy.get('.world').each($el => {
        if ($el[0].innerText.includes(worldName)) {
          cy.get('#delete-world').click({force: true})
          cy.get('.vue-dialog-buttons :last').click()
        }
      })
    });

    it('World well removed', () => {
      cy.get('#worlds').should('not.contain', worldName)
    });
  })

  context('Drop Database', () => {
      it('should drop db tests', () => {
        cy.exec(`${winpty} docker exec -it ce9 mongo ${dbName} --eval 'db.dropDatabase()'`, {failOnNonZeroExit: false})
        .its('code').should('eq', 1)
      });
  })

  context('Display Buttons', () => {

    it('displays a button to create a  world', () => {
      // cy.get(' form:nth-child(1) > button').click()
      cy.get('#btn-create-world')
        .should('exist')
    })
    it('displays a button to create a  view', () => {
      cy.get('#worlds .world:first-child .world-actions .btn-add-view > img')
        .should('exist')
    })
  })

  context('Create worlds', () => {

    it('should create new world', () => {
      cy.get('#btn-create-world').click({
        force: true
      });
      cy.wait(1000)
      cy.get('#data-view').find('.el-input__inner').type(worldName, {
        force: true
      })
      cy.get('.buttons > button').first().click({
        force: true
      })
      cy.get('#worlds').should('contain', worldName)
    })

    it('should create new view', () => {
      cy.get('#worlds .world:first-child .world-actions .btn-add-view').click({
        force: true
      });
      cy.get('#data-view').find('.el-input__inner').type(viewName, {
        force: true
      })
      cy.get('.buttons > button').click({
        force: true
      })
      cy.get(':first-child').get('.world').should('contain', viewName)


    })

    it('Add object model', () => {
      cy.get("#modals-container").as('modal')
      cy.fixture('objectModel.json').then(objectModel => {
        cy.get(':first-child').get('.world > div').then(($world) => {
          if (!$world.hasClass('is-active')) {
            cy.get('#worlds .world:first-child .el-collapse-item__arrow').click({
              force: true
            });
            cy.get('#worlds .world:first-child .view').click({
              force: true
            });

          }
        })

        cy.get('#open-dock').click();
        cy.get('#create-template-button').click();
        cy.get('#name-input').type('ObjectModelName')
        cy.get('@modal').get('#tab-tab-2').click().get('textarea.form-control')
        .then(textarea => {
          textarea[1].select()
          return textarea[1]
        })
        .type(objectModel.name,{
          parseSpecialCharSequences: false
        })


        cy.get('@modal').get('#tab-tab-3').click()
        cy.get(`aside ul li:first`).drag(".widget-form-list")

        cy.get('@modal').get('aside .el-input__inner')
        .then(input => {
          input[0].select()
          return input[0]
        })
        .type("name")

        cy.get('@modal').get('.buttons > :nth-child(2)').click()
        cy.wait(2000)
      })

      cy.get('.component > input').last().click()
      cy.get('#open-dock').click();
      cy.get('#dock > :last > .sticky > .color-text').first().click()
      cy.get('#data-view').find('.el-input__inner').type('Model{enter}', {
        delay: 200
      })
      cy.get('#wall').should('contain', 'Model')
      cy.wait(2000)

      cy.get('#logovw').click()
    });

  })
})

