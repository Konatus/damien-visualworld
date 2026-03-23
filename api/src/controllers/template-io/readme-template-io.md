# Modèle des données remontées à l'utilisateur

## template-io/get
  VW: {
    templates: [
      {
        _id: MongoId( 'xxx' ),
        private: {
          deletedAt: null,
          createdAt: Date( 2021-01-29T14:07:35+01:00 ),
          templatedBy: {
            user: 'xxx',
            worldId: MongoId( 'xxx' )
          },
          updatedAt: Date( 2021-01-29T14:07:35+01:00 )
        },
        data: {
          description: '',
          enableObjectCreation: true,
          enableObjectDuplication: true,
          enableObjectEdition: true,
          enableObjectResize: true,
          enableObjectDeletion: true,
          displayDefaultModel: true,
          name: test,
          screenshot: 'data:image/png;base64...',
          templateIsUpToDate: false,
          usedArea: {
            left: 5621,
            width: 1918,
            top: 3439,
            height: 724,
            under: 200000001
          }
        },
        state: {
          1627548998: {
            screenshot: 'data:image/png;base64...',
            usedArea: {
              left: 5621,
              width: 1918,
              top: 3439,
              height: 724,
              under: 200000001
            },
            VW: { /* Same as json-export */ },
            version: '1.0'
          },
          latest: 1627548998
        }
      }
    ]
  }