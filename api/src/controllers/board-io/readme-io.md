# Modèle des données remontées à l'utilisateur

## board-io/get
```
    VW: {
        objects:[
            {
                objectId: MongoId( 'xxx' ),
                componentId: MongoId( 'xxx' ),
                positionId: MongoId( 'xxx' ),
                object:{
                    data:{
                        /* variable */
                    },
                    private:{
                        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
                        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
                    }
                },
                protect: {
                    styleBackgroundColor: 'rgba(255,255,0,1),
                    styleOutlineColor: 'rgba(255,0,0,1),
                    styleColor: 'rgba(0,0,255,1),
                }
                position:{
                    data:{
                        width: 200,
                        height: 150,
                        top: 496,
                        left: 800,
                        zIndex: 987
                    },
                    protect:{
                        isBackground: false,
                    }
                    private:{
                        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
                        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
                    },
                },
                componentName: 'xxx',
            },
        ],
        components:[
            {
                _id: MongoId( 'xxx' ),
                data: {
                    name: 'xxx',
                    description: 'xxx',
                    schemaForm: '',
                    defaultWidth: 200,
                    defaultHeight: 150,
                    styleBackgroundColor: 'rgba(79, 123, 81, 1)',
                    styleColor: 'rgba(0, 0, 0, 1 )',
                    styleOutlineColor: 'rgba(218, 198, 79, 1)',
                    styleCss: 'border-radius:100%',
                    templateGraphicalStyle:{
                        id_du_champ: {
                            id: 'xxx'
                            styleBackgroundColor: 'rgba(79, 123, 81, 1)',
                            styleColor: 'rgba(0, 0, 0, 1 )',
                            styleTextAlign: 'top',
                        }
                    },
                    templateGraphical: [{ ... }],
                    templateHtml: '<div>toto</div>',
                    templateUseHtml: true
                },
            },
        ],
        boardComponents:[
            {
                "_id": MongoId( 'xxx' ),
                "data": {
                    foreground: [{ componentId: MongoId( 'xxx' ), rank: 18 }, { ... } ],
                    background: [{ componentId: MongoId( 'xxx' ), rank: 26 }, { ... } ],
                }
            }
        ],
        linkModels: [
            {
              _id: MongoId( 'xxx' ),
              data: {
                anchors: [
                  {
                    data: {
                      arrowhead: 0,
                      type: 'xxx'
                    }
                  },
                  {
                    data: {
                      arrowhead: 1,
                      type: 'xxx'
                    }
                  }
                ],
                color: 'rgba(199, 224, 0, 1)',
                curve: 0,
                dash: 10,
                description: '',
                name: 'xxx',
                size: 2
              }
            }
        ],
        links:[
            {
                _id: MongoId( 'xxx' ),
                linkModelId: MongoId( 'xxx' ),
                data: {
                    color: 'rgba(77, 77, 207, 1)',
                    curve: 0,
                    dash: 10,
                    default: false,
                    outlineColor: '#c4c6ef',
                    size: 2,
                    strokeWidth: 16,
                    titleColor: '#FFFFFF',
                    titleContent: '',
                    titleSize: 14,
                    title: ''
                },
                objects: [
                    {
                        _id: MongoId( 'xxx' ),
                        linkId: MongoId( 'xxx' ),
                        objectId: MongoId( 'xxx' ),
                        data: {
                            size: 4,
                            type: 'none'
                        }
                    },
                    {
                        _id: MongoId( 'xxx' ),
                        linkId: MongoId( 'xxx' ),
                        objectId: MongoId( 'xxx' ),
                        data: {
                            size: 4,
                            type: 'none'
                        }
                    }
                ]
            },
        ],
        board: {
            data: {
              name: 'xxx',
              screenshot: 'data:image/png;base64...'
            }
        }
    }
```