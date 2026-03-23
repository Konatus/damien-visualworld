# Base de données

## World - Monde

Dans la base `worlds`, la collection `Data` :
```
    {
        _id: MongoId( 'xxx' ),
        worldId: MongoId( 'xxx' ),
        data:{
            name: 'xxx',
            rootable: false,
            owner:'david@visual.world',
            team: ''
        },
        private:{
            useMaxDbSize: 1,
            useMaxGuest: 10,
            useMaxUser: 10,
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: 'xxx',
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: 'xxx',
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: 'xxx',
        }
    }
```

Dans la base `worlds`, la collection `Limit` :
```
    {
        _id: MongoId( 'xxx' ),
        worldId: MongoId( 'xxx' ),
        data:{
        "db": {
            "used": 0,
            "useMax": 2.7
        },
        "guest": {
            "used": {
                MongoId( 'boardId' ): 2,
                MongoId( 'boardId' ): 1
            }
            "useMax": 10
        },
        "user": {
            "used": 1,
            "useMax": 9
        }
        },
        private:{
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 )
        }
    }
```

Dans la base `worlds`, la collection `Users` :
```
    {
        _id: MongoId( 'xxx' ),
        worldId: MongoId( 'xxx' ),
        data:{
            "email": "david@visual.world",
            "terms": Date( 2021-01-29T14:07:35+01:00 )
        },
        private:{
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 )
        }
    }
```
## Board - Tableau

Dans la base du monde, la collection `Board` :
```
    {
        _id: MongoId( 'xxx' ),
        data:{
            name: 'xxx',
            description: 'xxx',
            enableObjectCreation: true,
            enableObjectDuplication: true,
            enableObjectEdition: true,
            enableObjectResize: true,
            enableObjectDeletion: true,
            displayDefaultModel: true,
            snapRadius: 10,
            snapBorder: true,
            snapHorizontalAxis: true,
            snapVerticalAxis: true,
            hiddenItems: {
                linkModels: []
            }
        }
        jira: {
                host: "https://atlassian.net",
                username: "david@visual.world",
                projects: [],
                webhook: {}
            },
        ultraPrivate: {
            jiraApiToken: ""
        }
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```
*private.createdBy is root's email when set by a root user. Same rule applies for next collections.*

## Component - Modèle

Dans la base du monde, la collection `Component` :
```
    {
        _id: MongoId( 'xxx' ),
        data:{
            name: 'xxx',
            description: 'xxx,
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
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```

## Object - Objet

Dans la base du monde, la collection `Object` :
```
    {
        _id: MongoId( 'xxx' ),
        data:{
            /* variable */
        },
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```

## Link - Lien

Dans la base du monde, la collection `Link` :
```
    {
        _id: MongoId( 'xxx' ),
        linkModelId: MongoId( 'xxx' ), 
        data:{
            color: rgba(255, 147, 0, 1),
            curve: 0,
            dash: 0,
            outlineColor:' #c4c6ef',
            size: 2,
            title: '',
            titleColor: '#FFFFFF',
            titleSize: 14
        },
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```
*Generic links do not have linkModelId property.*
*Links with linkModelId do not have data property.*

## Position - Position (Association Board-Component-Object)

Dans la base du monde, la collection `Position` :
```
    {
        _id: MongoId( 'xxx' ),
        componentId: MongoId( 'xxx' ),
        objectId: MongoId( 'xxx' ),
        boardId: MongoId( 'xxx' ),
        data:{
            width: 200,
            height: 150,
            top: 496,
            left: 800,
            zIndex: 987
        },
        protect: {
            isBackground: false,
        },
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```

## Dock - Palette (Association Board-Component)

Dans la base du monde, la collection `BoardComponent` :
```
    {
        _id: MongoId( 'xxx' ),
        data:{
            foreground: [{ componentId: MongoId( 'xxx' ), rank: 18 }, { ... } ],
            background: [{ componentId: MongoId( 'xxx' ), rank: 26 }, { ... } ],
        },
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
        }
    }
```

## (Association Object-Link)

Dans la base du monde, la collection `ObjectLink` :
```
    {
        _id: MongoId( 'xxx' ),
        objectId: MongoId( 'xxx' ),
        linkId: MongoId( 'xxx' ),
        data:{
            arrowhead: index,
            type: 'xxx',
        },
        private:{
            owner: 'david@visual.world',
            createdAt: Date( 2021-01-29T14:07:35+01:00 ),
            createdBy: MongoId( 'xxx' ),
            updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
            updatedBy: MongoId( 'xxx' ),
            deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
            deletedBy: MongoId( 'xxx' ),
        }
    }
```
### LinkModel - modèle de lien
Dans la base du monde, la collection `LinkModel` :
```
{
    _id: MongoId( 'xxx' ),
    private: {
        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
        createdBy: MongoId( 'xxx' ),
        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
        updatedBy: MongoId( 'xxx' ),
        deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
        deletedBy: MongoId( 'xxx' ),
    },
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
        color: rgba(240, 92, 69, 1),
        curve: 0,
        dash: 0,
        name: 'xxx',
        outlineColor: #c4c6ef,
        size: 2,
        title: '',
        titleColor: '#FFFFFF',
        titleSize: 14
    }
}
```
## User & Grant - Utilisateur & Autorisation

Dans la base du monde, la collection `User` :
```
{
    _id: MongoId( 'xxx' ),
    data:{
        email: 'david@visual.world',
        guestUntil:  Date( 2021-01-29T14:07:35+01:00 ) // only for guests
    },
    private:{
        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
        createdBy: MongoId( 'xxx' ),
        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
        updatedBy: MongoId( 'xxx' ),
        deletedAt: Date( 2021-01-29T14:07:35+01:00 ),
        deletedBy: MongoId( 'xxx' ),
    }
}
```

Dans la base du monde, la collection `Grant` :
```
{
    _id: MongoId( 'xxx' ),
    userId: MongoId( 'xxx' ),
    data:{
        administrator: true,
        animator: true,
    },
        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
        createdBy: MongoId( 'xxx' ),
        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
        updatedBy: MongoId( 'xxx' ),
    }
}
```

Dans la base du monde, la collection `BoardGrant` :
```
{
    _id: MongoId( 'xxx' ),
    userId: MongoId( 'xxx' ),
    boardId: MongoId( 'xxx' ),
    data:{
        animator: true,
        participant: true,
        observer: true
    },
    private:{
        createdAt: Date( 2021-01-29T14:07:35+01:00 ),
        createdBy: MongoId( 'xxx' ),
        updatedAt: Date( 2021-01-29T14:07:35+01:00 ),
        updatedBy: MongoId( 'xxx' ),
}