export default {
    board: {
        size: {
            width: 16000, //px
            height: 9000, //px
        },
        sticky: {
            margin: 5,
            onBorder: true,
            onCenter: true,
        },
        zIndex: {
            default: 100000000,
            deltaFrontBack: 700000000,
            max: 2147482000,
        },
        panZoom: {
            // minZoom is computed dynamically with each scene size change
            maxZoom: 5,
            smoothScroll: false,
            bounds: false,
            zoomSpeed: 0.5,
            pinchSpeed: 1.25,
            inputSpeed: 0.25,
            zoomDoubleClickSpeed: 1,
        },
        zoom: {
            clickCoeff: 0.3,
            scaleBoundsMargin: 0.1,
        },
    },
    shortcut: {
        dropZoneTopStartingPoint: 200,
        offset: 45,
    },
    modal: {
        install: {
            dynamic: true,
            dialog: true,
        },
        parameters: {
            draggable: false,
            resizable: false,
            scrollable: true,
            height: "auto",
            width: 700,
            clickToClose: false,
            classes: ["modal", "modal-board-options"],
            style: "z-index : 2147485000",
        },
        parameters_modal_data: {
            draggable: false,
            resizable: false,
            height: "auto",
            width: 650,
            clickToClose: false,
            classes: "modal",
        },
        parameters_object_data: {
            draggable: false,
            resizable: false,
            height: "90%", //"auto",
            width: 800,
            classes: "modal",
            clickToClose: false,
            style: "z-index : 2147485000",
        },
        parameters_world_edit: {
            draggable: false,
            resizable: false,
            height: "90%",
            width: "90%",
            classes: "modal",
            style: "z-index : 2147485000",
        },
        parameters_profile_edit: {
            draggable: false,
            resizable: false,
            height: "80%",
            width: 650,
            classes: "modal",
            style: "z-index : 2147485000",
        },
        parameters_library_of_universe: {
            draggable: false,
            resizable: false,
            height: "90%",
            width: "85%",
            classes: ["modal modal-component-library"],
        },
        parameters_component_edit: {
            draggable: false,
            resizable: false,
            width: "90%",
            height: "90%",
            clickToClose: false,
            classes: "modal-component-edit",
            style: "z-index : 2147485000",
        },
        parameters_link_model_edit: {
            draggable: false,
            resizable: false,
            height: "85%",
            width: "65%",
            classes: "modal-link-model",
            style: "z-index : 2147485000",
        },
        parameters_terms_and_conditions: {
            draggable: false,
            resizable: false,
            clickToClose: false,
            width: "900px",
            height: "auto",
            classes: "modal",
        },
        parameters_jira_issue_list: {
            draggable: false,
            resizable: false,
            width: "74%",
            height: "90%",
        },
    },
    searchBar: {
        lengthSearch: 2,
        lengthContent: 15,
    },
    defaultLink: {
        color: "rgba(152, 152, 162, 1)",
        size: 2,
        dash: 0,
        curve: 0,
        title: "",
    },
    defaultLinkObject: [
        {
            arrowhead: 0,
            type: "none",
        },
        {
            arrowhead: 1,
            type: "none",
        },
    ],
    linkStyle: {
        xSmall: { size: 0.3, fontSize: 10, gapWithoutAnchors: 2 },
        small: { size: 1.0, fontSize: 13, gapWithoutAnchors: 4 },
        medium: { size: 2.0, fontSize: 16, gapWithoutAnchors: 7 },
        large: { size: 3.0, fontSize: 18, gapWithoutAnchors: 9 },
    },
    defaultComponent: {
        hash: "empty",
        data: {
            name: "",
            description: "",
            schemaForm: "",
            defaultWidth: 200,
            defaultHeight: 150,
            urldefaultWidth: 150,
            urlDefaultHeight: 200,
            styleBackgroundColor: "rgba(254, 248, 196, 1)",
            styleColor: "rgba(0, 0, 0, 1)",
            styleOutlineColor: "",
            styleCss: "",
            templateGridStack: '{"grid":[],"columns":12,"rows":12}',
            templateGridStackStyle: {},
            templateHtml: "",
            templateUseHtml: false,
            defaultModel: false,
        },
    },
    visualWorldComponent: {
        VW_default: "56575f64656661756c743030",
        VW_img_model: "56575f696d675f6d6f64656c",
        VW_svg_model: "56575f7376675f6d6f64656c",
        VW_url_model: "56575f75726c5f6d6f64656c",
        VW_jira_us_model: "56575f6a6972615f75735f6d",
    },
    jiraLinkModel: {
        jiraParentLinkModel: "6a697261506172656e744c69",
        jiraIssueLinkModel: "6a69726149737375654c696e",
    },
    jiraComponentMapping: {
        // Mapping des types d'issues Jira vers les componentIds
        epic: "681bccf2fe6d770bea41690d", // K - Feature
        task: "681bd1c4fe6d77d26c416b9a", // K - Work Item
        story: "681bd1c4fe6d77d26c416b9a", // K - Work Item
        bug: "681bd1c4fe6d77d26c416b9a", // K - Work Item
        subtask: "681bd1c4fe6d77d26c416b9a", // K - Work Item
        "sub-task": "681bd1c4fe6d77d26c416b9a", // K - Work Item
        default: "681bd1c4fe6d77d26c416b9a", // K - Work Item par défaut (sauf Epic)
    },
    templateGridStackStyle: {
        content: "",
        styleBackgroundColor: "",
        styleColor: null,
        styleTextAlign: "left",
        styleFont: true,
        styleFontWeightBold: "",
        styleTextDecorationUnderline: "",
        styleFontStyleItalic: "",
    },
    dynamicComponent: {
        colCount: 12,
        minFontSize: 8,
        maxFontSize: 150,
    },
    tooltip_config: {
        delay: 400,
    },
    color_picker: {
        delay: 200,
    },

    colors: [
        "#111111",
        "#5A6275",
        "#939AA9",
        "#3F51B5",
        "#2196F3",
        "#29DEDE",
        "#49A84D",
        "#91C810",
        "#FAE315",
        "#FF9500",
        "#E20101",
        "#FF3495",
        "#9C27B0",
        "#FFFFFF",
        "#D6D8DC",
        "#E4E6E9",
        "#CFD3EC",
        "#C7E5FC",
        "#C9F7F7",
        "#D1E9D2",
        "#E3F1C3",
        "#FEF8C4",
        "#FFE4BF",
        "#F8BFBF",
        "#FFCCE5",
        "#E6C9EB",
        "rgba(255, 255, 255, 0.3)",
        "rgba(90, 98, 117, 0.3)",
        "rgba(147, 154, 169, 0.3)",
        "rgba(63, 81, 181, 0.3)",
        "rgba(33, 150, 243, 0.3)",
        "rgba(41, 222, 222, 0.3)",
        "rgba(73, 168, 77, 0.3)",
        "rgba(145, 200, 16, 0.3)",
        "rgba(250, 227, 21, 0.3)",
        "rgba(255, 149, 0, 0.3)",
        "rgba(226, 1, 1, 0.3)",
        "rgba(255, 52, 149, 0.3)",
        "rgba(156, 39, 176, 0.3)",
    ],

    /* Dont forget to edit app.css also */
    grantColor: {
        owner: "#F05C45",
        administrator: "#F05C45",
        modeler: "#E3AD2D",
        animator: "#E53F7A",
        participant: "#0099CF",
        observer: "#009C8F",
    },
    useMax: {
        useMaxDbSize: 1,
        useMaxGuest: 10,
        useMaxUser: 10,
        useMaxJiraProjects: 5,
    },
    maxUploadSize: 1048576 * 2, // 2Mo Annotation 'nginx.ingress.kubernetes.io/proxy-body-size: 2m' should be added in ingress
    objectLinked: {
        width: 230,
        height: 150,
    },
    objectJiraUs: {
        width: 250,
        height: 150,
    },
    lagOffset: 40,
    delayBeforeHide: 4000 /* ms */,
};
