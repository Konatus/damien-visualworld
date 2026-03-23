export default {
    fr: {
        fm: {
            components: {
                basic: {
                    title: "Propriétés simples",
                },
                advance: {
                    title: "Propriétés avancés",
                },
                layout: {
                    title: "Disposition",
                },
                fields: {
                    input: "texte court",
                    textarea: "texte long",
                    number: "nombre",
                    radio: "bouton radio",
                    checkbox: "case à cocher",
                    time: "heure",
                    date: "date",
                    rate: "notation",
                    color: "couleur",
                    select: "liste déroulante",
                    switch: "switch",
                    slider: "slider",
                    text: "libellé",
                    blank: "personnaliser", // what is it ?
                    imgupload: "image",
                    editor: "texte riche",
                    cascader: "? cascader ?", // what is it ?
                    grid: "Séparation",
                },
            },
            description: {
                containerEmpty: "Glissez-ici les propriétés à ajouter",
                configEmpty: "Veuillez ajouter un champ",
                tableEmpty: "Glissez-ici les propriétés à ajouter", // is it relevant ?
                uploadJsonInfo:
                    "Format JSON correspondant. Vous pouvez le modifier.",
            },
            message: {
                copySuccess: "Copié",
                validError: "La validation des données du formulaire a échoué",
            },
            actions: {
                import: "Import JSON",
                clear: "Effacer",
                preview: "Aperçu",
                json: "Récupérer le JSON",
                code: "Récupérer le code",
                getData: "Récupérer les données",
                reset: "Reset",
                copyData: "Copier les données",
                cancel: "Annuler",
                confirm: "Confirmer",
                addOption: "Ajouter une option",
                addColumn: "Ajouter une colonne",
                addTab: "Ajouter un onglet",
                upload: "Téléverser",
                add: "Ajouter",
            },
            config: {
                form: {
                    title: "Configurer les libellés",
                    labelPosition: {
                        title: "Position du titre",
                        left: "Gauche",
                        right: "Droite",
                        top: "Au-dessus",
                    },
                    labelWidth: "Largeur",
                    size: "Taille",
                    customClass: "Classe personnalisée",
                },
                widget: {
                    title: "Configurer la propriété",
                    model: "Identifiant",
                    name: "Nom",
                    width: "Largeur",
                    height: "Hauteur",
                    size: "Taille",
                    labelWidth: "Largeur du titre",
                    custom: "Personnaliser",
                    placeholder: "Placeholder",
                    layout: "Disposition",
                    block: "Colonne",
                    inline: "Ligne",
                    contentPosition: "Position du titre",
                    left: "Gauche",
                    right: "Droite",
                    center: "Centre",
                    showInput: "Edition manuelle",
                    min: "Minimum",
                    max: "Maximum",
                    step: "Ecart",
                    multiple: "Choix multiple",
                    filterable: "Recherche possible",
                    allowHalf: "Autoriser les demis",
                    showAlpha: "Transparence",
                    showLabel: "Afficher l'intitulé",
                    option: "Options",
                    staticData: "Données statiques",
                    remoteData: "Données réactives",
                    remoteFunc: "Fonction",
                    value: "Valeur",
                    label: "Label",
                    childrenOption: "Option secondaire",
                    defaultValue: "Par défaut",
                    showType: "Format d'affichage",
                    isRange: "Plage horaire",
                    isTimestamp: "Timestamp",
                    startPlaceholder: "Début par défaut",
                    endPlaceholder: "Fin par défaut",
                    format: "Format horaire",
                    limit: "Nombre de téléchargements max.",
                    isQiniu: "Téléverser sur le cloud Qiniu",
                    tokenFunc: "Fonction pour récupérer Qiniu Uptoken",
                    imageAction: "Adresse de l'image",
                    tip: "Texte d'information",
                    action: "Téléverser l'image avec son adresse",
                    defaultType: "Variables",
                    string: "Chaîne de caractères",
                    object: "Objet",
                    array: "Tableau",
                    number: "Nombre",
                    boolean: "Booléen",
                    integer: "Entier",
                    float: "Décimale",
                    url: "URL",
                    email: "E-mail",
                    hex: "Hexadécimal",
                    gutter: "Espacement",
                    columnOption: "Colonnes",
                    span: "Taille",
                    justify: "Disposition horizontale",
                    justifyStart: "Début",
                    justifyEnd: "Fin",
                    justifyCenter: "Centre",
                    justifySpaceAround: "Répartir",
                    justifySpaceBetween: "Répartir du début",
                    align: "Disposition verticale",
                    alignTop: "Haut",
                    alignMiddle: "Milieu",
                    alignBottom: "Bas",
                    type: "Type",
                    default: "Par défaut",
                    card: "Onglets",
                    borderCard: "Border-Card", // only exists in labels
                    tabPosition: "Position de l'onglet",
                    top: "Haut",
                    bottom: "Bas",
                    tabOption: "Titres",
                    tabName: "Nom de l'onglet",
                    customClass: "Classe personnalisée",
                    attribute: "Configuration",
                    dataBind: "Données réactives",
                    hidden: "Caché",
                    readonly: "Lecture seule",
                    disabled: "Désactivé",
                    editable: "Edition dans le champ",
                    clearable: "Afficher le bouton effacer",
                    arrowControl: "Sélection avec les flèches directionnelles",
                    isDelete: "Supprimable",
                    isEdit: "Modifiable",
                    showPassword: "Afficher le mot de passe",
                    validate: "Validation",
                    required: "Requis",
                    patternPlaceholder: "Filtrer (expressions régulières)",
                    newOption: "Autre option",
                    tab: "Onglet",
                    validatorRequired: "Champ requis",
                    validatorType: " Type {type} non respecté",
                    validatorPattern: "Schéma {pattern} non respecté",
                },
                rules: {
                    model: {
                        required: "L'identifiant est requis.",
                        allowedChars:
                            "L'identifiant ne doit contenir que des minuscules non accentuées, des chiffres ou des tirets bas.",
                    },
                },
            },
            upload: {
                preview: "Aperçu",
                edit: "Modifier",
                delete: "Supprimer",
            },
        },

        app_name: "Visual World",

        modal: {
            yes: "Oui",
            no: "Non",
            ok: "OK",
            submit: {
                validate: "Valider",
                cancel: "Annuler",
            },
        },
        icon: {
            VW: "VW",
            board: "Tableau",
            users: "Utilisateurs",
            components: "Modèles d'objets",
            layer: "Plan",
            three_dots: "Plus...",
            delete: "Supprimer",
            undo: "Annuler",
            redo: "Refaire",
        },

        home: {
            title: "Liste des mondes",
            search_in_world_list: "Rechercher dans les mondes",
            add_world: "Ajouter un monde",
            restore_world: "Restaurer un monde supprimé",
            delete_world: "Supprimer le monde",
            update_world: "Renommer le monde",
            parameters: "Paramètres",
            root_parameters: "Root",
            no_world_is_available: "Vous n'avez accès à aucun monde.",
            modal: {
                create_world_submit: "Créer le monde",
                create_world_title_modal: "Nouveau Monde",
                create_world_name: "Nom",
                create_world_team: "Équipe",
                create_world_owner: "Propriétaire",
                create_world_name_error: "Veuillez renseigner le nom du monde",
                create_world_team_error:
                    "Veuillez renseigner le nom de l'équipe",
                create_world_owner_error:
                    "Veuillez renseigner le mail de propriétaire",
                create_world_owner_wrong_email: "E-mail incorrect",
                delete_world_title: "Supprimer le monde",
                delete_world_content:
                    "Êtes-vous sûr de vouloir supprimer le monde ?",

                create_board_title: "Créer un tableau",
                delete_board_title: "Supprimer le tableau",
                delete_board_content:
                    "Êtes-vous sûr de vouloir supprimer le tableau ?",
                create_board_title_modal: "Nouveau tableau",
                create_board_name: "Nom du tableau",
                create_board_description: "Description",
                create_board_name_error:
                    "Veuillez renseigner le nom du tableau",
                create_board_submit: "Créer le tableau",

                create_board_template_title_modal:
                    "Nouveau template de tableau",
                create_board_template_name: "Nom du template",
                create_board_template_description: "Description",
                create_board_template_name_error:
                    "Veuillez renseigner le nom du template",
                create_board_template_submit: "Créer le template",
            },
        },

        root_world: {
            title: "Paramètres root du monde",
            tabs: {
                general: "Général",
                limits: "Limites",
            },
            team: "Équipe",
            owner: "Propriétaire",
            world_owner_error: "Veuillez renseigner le mail de propriétaire",
            wrong_email: "E-mail incorrect",
        },

        world: {
            title: "Gestion du monde",
            name: "Nom du monde",
            user: {
                title: "Utilisateurs",
                email: "E-mail",
                required_email: "Veuillez saisir un email",
                required_date: "Veuillez saisir une date",
                used_email: "E-mail(s) déjà utilisé(s) : {email}",
                wrong_email: "E-mail(s) incorrect(s) : {email}",
                basic_user: "Utilisateur",
                object_manager: "Gestionnaire de modèles",
                board_manager: "Gestionnaire de tableaux",
                world_manager: "Gestionnaire de monde",
                modal: {
                    user_singular:
                        "Êtes-vous sûr de vouloir supprimer cet utilisateur&nbsp;?",
                    user_plural:
                        "Êtes-vous sûr de vouloir supprimer ces utilisateurs&nbsp;?",
                    guest_singular:
                        "Êtes-vous sûr de vouloir supprimer cet invité&nbsp;?",
                    guest_plural:
                        "Êtes-vous sûr de vouloir supprimer ces invités&nbsp;?",
                },
            },
            ressources: {
                title: "Utilisation des ressources",
            },
            parameters: {
                title: "Paramètres du monde",
                tabs: {
                    general: "Général",
                    licenses_management: "Licences",
                    users_management: "Utilisateurs du monde",
                    deleted_users: "Utilisateurs supprimés",
                    deleted_boards: "Tableaux supprimés",
                },
                name: "Nom",
                description: "Description",
                rootable: "Autoriser les roots à accéder au monde",
            },
            world_use: {
                users: "Utilisateurs",
                guests: "Invités",
                dbSize: "Base de données (en Go)",
                jiraProjects: "Projets Jira",
                maxUsers: "Nombre d'utilisateurs maximum",
                maxJiraProject: "Nombre maximum de tableaux Jira",
                maxGuests: "Nombre d'invités maximum par tableau",
                maxDbSize: "Taille maximum de la base de données (en Go)",
            },
        },

        board: {
            name: "Nom du tableau",
            home_title: "Tableaux du monde",
            sort_name: "Nom",
            sort_date: "Date de création",
            title: "Gestion du tableau",
            creation_date: "Créé le",
            options: "Plus d'options",
            parameters: {
                title: "Paramètres du tableau",
                tabs: {
                    general: "Général",
                    feature_flipping: {
                        title: "Fonctions",
                        subtitle: "Configuration des accès des participants",
                    },
                    users_management: "Utilisateurs",
                    guests_management: "Invités",
                    deleted_users: "Utilisateurs supprimés",
                    components_display: "Affichage des objets",
                    link_models_display: "Affichage des liens",
                    jira_sync: "Synchronisation jira",
                },
                name: "Nom",
                description: "Description",
                enable_object_creation:
                    "Autoriser la création d'objets et liens",
                enable_object_duplication: "Autoriser la duplication d'objets",
                enable_object_edition:
                    "Autoriser la modification d'objets et liens",
                enable_object_resize:
                    "Autoriser le redimensionnement par glisser-déplacer",
                enable_object_deletion:
                    "Autoriser la suppression d'objets et liens",
                enable_object_model_deletion:
                    "Autoriser la modification de modèle d'objets",
                snap: "Magnétisme",
                grid_enabled: "Aligner sur la grille",
                grid_x: "Largeur de grille",
                grid_y: "Hauteur de grille",
                snap_radius: "Distance",
                snap_border: "Sur les côtés",
                snap_vertical_axis: "Sur l'axe vertical",
                snap_horizontal_axis: "Sur l'axe horizontal",
            },
        },

        not_found: {
            subtitle: {
                not_found_world:
                    "Hum... Cette étoile brille encore mais n'existe plus !",
                not_found_board:
                    "Hum... Cette étoile brille encore mais n'existe plus !",
                not_found_page:
                    "Hum... Cette étoile brille encore mais n'existe plus !",
                not_granted: "Vous n'êtes pas autorisé à vous poser ici.",
            },
            message: {
                not_found_world: "La page demandée n'existe pas.",
                not_found_board: "La page demandée n'existe pas.",
                not_found_page: "La page demandée n'existe pas.",
                not_granted:
                    "Vous devez disposer d'une autorisation pour accéder à cette page.",
            },
            back_to_home: "Retourner à l'accueil",
        },

        top_menu: {
            home: "Accueil",
            options: {
                pdf_export: "Exporter en PDF",
                png_export: "Exporter en PNG",
                xl_export: "Exporter vers Excel",
                json_export: "Télécharger les objets du tableau (.json)",
                json_import: "Importer des objets dans le tableau (.json)",
            },
            breadcrumb: {
                is_template: "Template de tableau",
                save_template: "Publier le template",
                load_template: "Rétablir la publication du {date}",
                board_settings: "Paramètres de ce tableau",
                import_json: "Importer un fichier JSON",
                import_xlsx: "Importer depuis Excel",
                import: "Importer",
                export: "Exporter",
                export_json: "Exporter en JSON",
                export_png: "Exporter en PNG",
                export_pdf: "Exporter en PDF",
                export_xlsx: "Exporter en XLSX",
                export_docx: "Exporter en DOCX",
            },
        },

        left_menu: {
            dock: {
                open_dock: "Ajouter des objets",
            },
            library: {
                access_libraries: "Accéder aux catalogues",
            },
            layer: {
                foreground: "1er plan",
                background: "Fond",
            },
            mode: {
                normal: "Mode normal",
                select: "Mode sélection",
                draw: "Mode dessin",
                link: "Mode création de liens",
            },
        },

        toolbar: {
            edit_component: "Édition du modèle",
            transmute_object: "Transformer les objets",
            no_transmute_object: "Impossible de transformer les objets",
            title_singular: "Note",
            title_plural: "Sélection",
            duplicate: "Duplication",
            initial_width: "L",
            initial_height: "H",
            rotate: "Pivoter",
            send_forward: "Déplacer vers l'avant",
            send_backward: "Déplacer vers l'arrière",
            send_foreground: "Envoyer au premier plan",
            send_background: "Envoyer à l'arrière plan",
            shortcut: "Afficher aussi sur",
            prevent_shortcut:
                "Tous les objets sélectionnés sont déjà présents dans les tableaux disponibles",
            shortcut_modal: {
                title: "Avertissement raccourcis",
                text: "Seuls les objets non présents sur le tableau ciblé y seront affichées",
            },
            edit: "Édition",
            prevent_edit: "Aucune propriété à modifier",
            delete_object_singular: "Supprimer l'objet",
            delete_object_plural: "Supprimer les objets",
            align_left: "Aligner à gauche",
            align_right: "Aligner à droite",
            align_bottom: "Aligner en bas",
            align_top: "Aligner en haut",
            center_horizontally: "Centrer horizontalement",
            center_vertically: "Centrer verticalement",
            distribute_horizontally: "Distribuer horizontalement",
            distribute_vertically: "Distribuer verticalement",
            position: "Position",
            align: "Alignement",
        },

        restore: {
            worlds: "Mondes supprimés",
            empty: "Il n'y a rien à restaurer.",
            table: {
                button: "Restaurer",
                name: "Nom",
                email: "E-mail",
                deleted_on: "Supprimé le",
            },
            modal: {
                world_title: "Restaurer un monde",
                board_title: "Restaurer un tableau",
                user_title: "Restaurer un utilisateur",
                text: "Voulez-vous restaurer",
            },
        },

        component_edit: {
            create: "Créer un modèle",
            update: 'Modifier le modèle "{componentName}"',
            delete: {
                title: 'Supprimer le modèle "{componentName}"',
                existing_items:
                    'Des objets de ce modèle sont présents sur le(s) tableau(x) suivant(s) : "{boardNames}". La suppression du modèle changera ces objets en Notes.',
                text: "Êtes-vous sûr de vouloir supprimer le modèle d'objet ?",
            },
            submit: {
                validate: "Enregistrer les modifications",
                create: "Créer le modèle",
                cancel: "Annuler",
            },
            validation: {
                name: {
                    required: "Veuillez saisir un nom",
                    existing: 'Un modèle "{componentName}" existe déjà.',
                },
            },
            computed: {
                add: "Ajouter une valeur calculée",
                delete: {
                    label: "Supprimer",
                    confirm_singular:
                        "Êtes-vous sûr de vouloir supprimer cette valeur calculée&nbsp;?",
                    confirm_plural:
                        "Êtes-vous sûr de vouloir supprimer ces valeurs calculées&nbsp;?",
                },
                validation: {
                    model: {
                        required: "Nom requis",
                        allowed_chars:
                            "Minuscules non accentuées, chiffres ou tirets bas uniquement.",
                        existing: "Nom déjà attribué",
                    },
                    formula: {
                        required: "Formule requise",
                        syntax: "La syntaxe n'est pas correcte. {exception}",
                    },
                },
                header: {
                    model: "Nom",
                    formula: "Formule de calcul",
                },
                placeholder: {
                    model: "Nom",
                    formula: "Formule de calcul",
                },
            },
            watcher: {
                add: "Ajouter un déclencheur",
                delete: {
                    label: "Supprimer",
                    confirm_singular:
                        "Êtes-vous sûr de vouloir supprimer ce déclencheur&nbsp;?",
                    confirm_plural:
                        "Êtes-vous sûr de vouloir supprimer ces déclencheurs&nbsp;?",
                },
                validation: {
                    given: {
                        required: "Condition d'exécution requise",
                        syntax: "La syntaxe n'est pas correcte. {exception}",
                    },
                    when: {
                        required: "Propriété à écouter requise",
                    },
                    thenKey: {
                        required: "Propriété à modifier requise",
                        syntax: "La syntaxe n'est pas correcte. {exception}",
                    },
                    thenValue: {
                        required: "Nouvelle valeur requise",
                        syntax: "La syntaxe n'est pas correcte. {exception}",
                    },
                },
                header: {
                    given: "Given",
                    when: "When",
                    then: "Then",
                },
                placeholder: {
                    given: "Condition d'exécution",
                    when: "Propriété à écouter",
                    thenKey: "Propriété à mettre à jour",
                    thenValue: "Nouvelle valeur",
                },
            },
            template: {
                use_graphical_template: 'Mode simple "glisser-déposer" ',
                use_advanced_template: "Mode avancé HTML",
                object: "Objet",
                property: "Propriété",
                error: "Syntaxe incorrecte",
                html: {
                    error: "Erreur : ",
                    syntax_error: `la syntaxe est incorrecte.`,
                    javascript_reserved_word: `ce mot est réservé pour le code Javascript.`,
                    non_reactive_property: `cette valeur de propriété ne peut pas être réactive.`,
                    passive_and_prevent: `les modificateurs d'événements 'passive' et 'prevent' ne peuvent pas être utilisés ensemble.`,
                    modified_empty_on: `les modificateurs d'événements ne peuvent pas s'appliquer sans argument.`,
                    required_key_for_v_once_in_v_for: `la directive 'v-once' a besoin d'un attribut 'key' à l'intérieur d'un 'v-for'.`,
                    has_no_matching_end_tag: `la balise n'est pas correctement fermée.`,
                    mal_formatted_tag_at_end_of_template: `la balise est mal formée.`,
                    exactly_one_root: `le modèle doit contenir une et une seule balise de premier niveau.`,
                    slot_or_template_on_root: `la balise de premier niveau ne peut pas être 'slot' ou 'template'.`,
                    v_for_on_root: `la balise de premier niveau ne peut pas utiliser la directive 'v-for'.`,
                    text_on_root: `la balise de premier niveau ne peut pas être un texte.`,
                    text_outside_root: `le texte en dehors de la balise de premier niveau sera ignoré.`,
                    attribute_non_letter_char: `les attributs ne peuvent contenir que des lettres, des chiffres ou des tirets.`,
                    style_or_script_tag: `cette balise n'est pas autorisée.`,
                    key_on_template: `l'attribut 'key' ne peut pas être utilisé sur une balise 'template'.`,
                    key_on_transition_group_children: `l'attribut 'key' ne peut pas être utilisé sur les enfants d'une balise 'transition-group'.`,
                    invalid_v_for: `le contenu de la directive 'v-for' est incorrect.`,
                    v_else_without_v_if: `cette directive a besoin d'un 'v-if'.`,
                    text_between_v_if_and_v_else: `le texte entre les conditions sera ignoré.`,
                    scope_is_deprecated: `l'attribut 'scope' est déprécié.`,
                    v_for_and_slot_scope: `la directive 'v-for' et l'attribut 'slot-scope' ne peuvent pas être utilisées ensemble.`,
                    different_slot_syntaxes: `mélange inattendue de syntaxes différentes de 'slot'.`,
                    template_v_slot_not_root: `la directive 'v-slot' ne peut être utilisée avec un 'template' qu'au premier niveau.`,
                    v_slot_not_template_nor_component: `la directive 'v-slot' ne peut être utilisée avec un 'template' au un composant Vue.`,
                    default_v_slot_not_template: `la directive 'slot' par défaut devrait utiliser être un 'template'.`,
                    v_slot_without_slot_name: `la direcctive 'v-slot' nécessite un nom de slot.`,
                    key_on_slot: `l'attribut 'key' ne peut pas être utilisé sur une balise 'slot'.`,
                    empty_v_bind: `les attributs ne doivent pas être vides.`,
                    mustache_in_attribute: `les moustaches '{{ }}' ne peuvent pas être utilisés pour définir un attribut.`,
                    duplicate_attribute: `cet attribut est défini plusieurs fois.`,
                    v_for_and_v_model: `les directives 'v-for' et 'v-model' ne peuvent pas être utilisées ensemble.`,
                    v_model_on_file_input: `la directive 'v-model' ne peut pas être utilisée dans un 'input' de type 'file'.`,
                    value_and_v_model: `la directive 'v-model' et la propriété 'value' ne peuvent pas être utilisées ensemble.`,
                    warning: "Attention : ",
                    attribute_first_char: `les attributs doivent commencer par les caractères ':', '@', '#' ou une lettre. `,
                    attribute_last_char: `les attributs doivent terminer par une lettre.`,
                    html_event_handler: `les événements HTML natifs ne sont pas autorisés ; ils seront ignorés.`,
                    non_white_listed_tag: `cette balise n'est pas autorisée ; elle sera ignorée.`,
                    info: "Information : ",
                    fit_should_be_static_text: `les balises fit ne devrait contenir qu'un texte statique.`,
                },
            },
            definition_form: {
                name: " Nom : ",
                description: "Description : ",
            },
            field_dock: {
                properties: "Propriétés",
                computed: "Valeurs calculées",
            },
            style_form: {
                colors: "Couleurs",
                overloadable: "Modifiable par les utilisateurs",
                default_width: "Largeur",
                default_height: "Hauteur",
                style: "CSS supplémentaire",
            },
            style_field: {
                content: "Contenu",
                colors: "Couleurs",
                delete_field: "Supprimer la propriété",
                alignment: {
                    label: "Alignement",
                    left: "left",
                    center: "center",
                    right: "right",
                    justify: "justify",
                },
                advanced_style: {
                    label: "Style avancé",
                    bold: "bold",
                    italic: "italic",
                    underline: "underline",
                },
            },
            tabs: {
                definition: "Définition",
                properties: "Propriétés",
                computed: "Valeurs calculées",
                watcher: "Déclencheurs",
                template: "Affichage",
            },
        },

        library: {
            title: "Catalogue du monde",
            tabs: {
                templates: "Templates",
                components: "Objets",
                links: "Liens",
            },
            no_description: "Pas de description",
            template: {
                title: "Templates de tableaux",
                search: "Rechercher un template de tableau",
                screenshot: "Aperçu du template",
                add: "Ajouter au tableau",
                create: {
                    label: "Forger un template de tableau",
                },
                update: {
                    label: "Modifier",
                },
                duplicate: {
                    label: "Dupliquer",
                },
                delete: {
                    label: "Supprimer",
                    modal_title: "Supprimer le template",
                    modal_content:
                        "Êtes-vous sûr de vouloir supprimer le template de tableau ?",
                },
                currentlyUpdating: "En cours de modification",
                root_options: "Options root",
                export: {
                    label: "Exporter",
                },
                import: {
                    label: "Importer",
                },
            },
            component: {
                title: "Modèles d'objets",
                search: "Rechercher un modèle d'objet",
                add_dock: "Ajouter",
                remove_dock: "Retirer",
                show_trashed: "Modèles supprimés",
                create: {
                    label: "Forger un nouveau modèle d'objet",
                },
                update: {
                    label: "Modifier",
                },
                restore: {
                    label: "Restaurer",
                },
                duplicate: {
                    label: "Dupliquer",
                },
                delete: {
                    label: "Supprimer",
                },
                default_model: "Note",
                add_remove: "Ajouter/retirer",
            },
            link: {
                title: "Modèles de liens",
                search: "Rechercher un modèle de lien",
                show_trashed: "Modèles supprimés",
                create: {
                    label: "Forger un nouveau modèle de lien",
                },
                update: {
                    label: "Modifier",
                },
                restore: {
                    label: "Restaurer",
                },
                delete: {
                    label: "Supprimer",
                },
            },
            item_model_display_management: {
                hide: "Masquer",
                display: "Afficher",
            },
        },

        link_model_edit: {
            create: "Création d'un nouveau modèle de lien",
            submit: {
                validate: "Enregistrer",
                cancel: "Annuler",
            },
            required: {
                name: "Veuillez saisir un nom",
            },
            name_label: "Nom :",
            description_label: "Description :",
            name_placeholder: "Choisissez un nom",
            description_placeholder: "Choisissez une description",
            link_style: "Style de lien",
            link_type: "Type de lien",
            update: 'Modifier le modèle "{linkModelName}"',
            delete: {
                title: 'Supprimer le modèle "{linkModelName}"',
                existing_items:
                    'Des objets liés par un lien de ce modèle sont présents sur le(s) tableau(x) suivant(s) : "{boardNames}".',
                text: "Êtes-vous sûr de vouloir supprimer le modèle de lien ?",
            },
        },

        board_object: {
            modal: {
                create_title: 'Créer un objet de type "{componentName}"',
                edit_title: 'Édition d\'objet "{componentName}"',
                title_default_model: "Note",
                shortcut_title: "Envoyer à travers un raccourci",
                shortcut_text:
                    "Voulez-vous envoyer la sélection vers le tableau ?",
                delete_title_shortcut: "Supprimer un raccourci",
                delete_shortcut:
                    "Êtes-vous sûr de vouloir supprimer ce raccourci ?",
                reset_previous_value: "Voulez-vous annuler vos modifications ?",
            },
        },

        object_data: {
            tabs: {
                details: "Données",
                others: "Autres",
                data_calc: "Données calculées",
                data_trash: "Données fantômes",
                links: "Liens",
            },
            upload_failed: "Le fichier n'a pas pu être chargé.",
            upload_is_too_large:
                "Fichier trop volumineux : ce fichier occupe {fileSize} Mo d'espace ; la taille maximale est de {maxUploadSize} Mo.",
            submit: "Créer l'objet",
            custom_size: "Taille (l x h): ",
            change_component: "Changer de modèle d'objet:",
            close: "Fermer",
        },

        json_import: {
            title: "Import json",
            default_json_input: "Fichier json",
            options: "Options d'import",
            screenshot: "Aperçu du tableau à importer",
            import_options: {
                import_foreground: "Importer les objets de surface",
                import_background: "Importer les objets de fond",
                import_links: "Importer les liens",
            },
            invalid_json_file: "Fichier JSON invalide.",
            default_import_error:
                "Une erreur s'est produite lors de la tentative d'import.",
            trashed_item: "existe dans ce monde mais a été supprimé.",
            not_found_item: "n'a pas été trouvé dans ce monde.",
            duplicate_jira_us: "ne peuvent pas être dupliquès",
        },
        template_import: {
            title: "Import json de templates",
            warning: "Les images ne seront pas importées",
            default_json_input: "Fichier json",
        },
        xlsx_import: {
            title: "Import excel",
            warning: "Les images ne seront pas importées",
            default_xlsx_input: "Fichier excel",
            options: "Options d'import",
            import_options: {
                import_foreground: "Importer les objets de surface",
                import_background: "Importer les objets de fond",
                import_links: "Importer les liens",
            },
            labels: {
                board_update: "Mise à jour du tableau existant",
            },
            invalid_xlsx_file: "Fichier Excel invalide.",
            default_import_error:
                "Une erreur s'est produite. L'import a dû être interrompu.",
            component_not_found:
                'Onglet "Objets", ligne {line} : le modèle n\'existe pas dans ce monde.',
            object_missing_property:
                'Onglet "Objets", ligne {line} : il manque la propriété "{property}".',
            link_model_not_found:
                'Onglet "Liens", ligne {line} : le modèle n\'existe pas dans ce monde.',
            link_missing_anchor:
                'Onglet "Liens", ligne {line} : il manque une forme de terminaison.',
            link_missing_object:
                'Onglet "Liens", ligne {line} : il manque un objet à lier.',
            link_missing_property:
                'Onglet "Liens", ligne {line} : il manque la propriété "{property}".',
        },

        xlsx_export: {
            title: "Tableau",
            extension: ".xlsx",
            rows: "!rows",
            cols: "!cols",
            sheets: {
                objects: "Objets",
                links: "Liens",
            },
            headings: {
                componentName: "modèle",
                left: "x",
                top: "y",
                height: "h",
                width: "l",
                zIndex: "z-index",
                rotation: "rotation",
                layer: "plan",
                styleBackgroundColor: "couleur de fond",
                styleOutlineColor: "couleur bordures",
                styleColor: "couleur du texte",
                linkOrigin: "origine",
                linkEnd: "cible",
                label: "libellé",
                linkModel: "modèle",
                curve: "forme",
                type: "type",
                color: "couleur",
                size: "épaisseur",
                dash: "style",
                originShape: "forme d'origine",
                endShape: "forme cible",
            },
            placeholders: {
                foreground: "premier",
                background: "fond",
                defaultLink: "Lien simple",
            },
        },

        docx_export: {
            title: "Export comme document DOCX",
            description:
                "Si vous ne fournissez pas de template personnalisé ci-dessous, le {defaultTemplate} sera utilisé pour l'export.",
            description_default_template: "template par défaut",
            template: "Template DOCX",
            default_docx_input: "Template par défaut",
            default_template_name: "VW-default-template.docx",
            invalid_docx:
                "Le fichier fourni n'est pas un document docx valide.",
            invalid_template: "Balisage incorrect.",
            invalid_json_fileata: "Erreur de syntaxe dans une balise.",
            error: "Une erreur s'est produite. L'export a dû être interrompu.",
        },

        links: {
            no: "Non",
            yes: "Oui",
            top: "Haut",
            bottom: "Bas",
            link: "Lien",
            size: "Taille",
            left: "Gauche",
            title: "Libellé du lien",
            dash: "Tirets",
            curve: "Courbe",
            square: "Carré",
            circle: "Cercle",
            right: "Droite",
            color: "Couleur",
            reset: "Annuler",
            edit: "Modifier",
            triangle: "Triangle",
            link_end: "Fin",
            link_start: "Début",
            link_options: "Options du lien",
            multiple_links: "Liens multiples",
            thickness: "Épaisseur",
            style: "Style",
            form: "Forme",
            invert: "Intervertir",
            no_link_type: "Pas de type de lien",
            default_link: "Lien simple",

            delete_link: "Êtes-vous sûr de vouloir supprimer le lien?",
            delete_this_link: "Supprimer ce lien",
            delete_title_singular: "Supprimer un lien",
            delete_title_plural: "Supprimer des liens",
            delete_content_singular:
                "Êtes-vous sûr de vouloir supprimer le lien ?",
            delete_content_plural:
                "Êtes-vous sûr de vouloir supprimer les liens ?",
            present_in_single_board: "Objet présent dans {nbr_tableau} tableau",
            present_in_plural_board:
                "Objet présent dans {nbr_tableau} tableaux",
            present_in_this_board: "Objets présents dans ce tableau",
            present_in_others_boards: "Objets présents dans d'autres tableaux",
        },

        draw: {
            thickness: "Épaisseur",
            eraser: "Gomme",
        },

        user: {
            grant_level: {
                root: "Root",
                owner: "Propriétaire",
                administrator: "Administrateur",
                modeler: "Modeleur",
                animator: "Animateur",
                participant: "Participant",
                observer: "Observateur",
            },
            joinUserScreen: "Rejoindre",
            get_token: "Obtenir un jeton de connexion",
            sign_out: "Me déconnecter",
        },

        users_parameters: {
            iWantToAdd: "Je souhaite ajouter",
            iWantToInvite: "Je souhaite inviter",
            addUserTitle:
                "Plusieurs e-mails peuvent être séparés par un espace ou un point-virgule",
            addUserValidate: "Valider",
            delete: "Supprimer",
            showUrlGuest: "Afficher les liens",
            search: "Rechercher",
            worldGrant: "Rôle sur le monde",
            boardGrant: "Rôle sur tableaux",
            boardLength: "Pas de droit | 1 tableau | {count} tableaux",
            email: "Email",
            guestUntil: "Invité jusqu'au",
            guestLink: {
                title: "Accès temporaires",
                email: "E-mail",
                guestUrl: "Lien invité",
            },
            date: {
                tonight: "Ce soir",
                tomorrow: "Demain",
                withinSevenDays: "7 jours",
            },
            demoWarning: "Fonctionnalité non disponible en mode DEMO",
        },

        user_use_warning: {
            title: "Attention",
            warn: "Vous ne pouvez pas ajouter {grant} supplémentaire : la limite liée à votre abonnement a été atteinte. Merci de vous rapprocher des administrateurs de votre monde ou de nous envoyer un mail à {supportMail}.",
            guest: "d'invité",
            user: "d'utilisateur",
            users: "utilisateur | utilisateur | utilisateurs",
            guests: "invité | invité | invités",
        },
        jira_use_warning: {
            title: "Limite atteinte",
            warn: "Vous ne pouvez pas ajouter de projet Jira  supplémentaire : la limite liée à votre abonnement a été atteinte. Merci de vous rapprocher des administrateurs de votre monde ou de nous envoyer un mail à {supportMail}.",
        },
        jira_issue: {
            error: {
                jira_project: "Projet est obligatoire",
                jira_issuetype: "Type de ticket est obligatoire.",
                jira_summary: "Résumé est obligatoire.",
                jira_epicname: "Epic name est obligatoire.",
            },
        },

        info: {
            title: "N° de version :",
            help: "Aide",
            terms: "Mentions légales",
        },

        search_bar: {
            input_placeholder: "Rechercher un objet",
            template_name: "Objet",
            board_name_singular: "Tableau",
            board_name_plural: "Tableaux",
        },

        overlay_alert: {
            fatal_error:
                "La connexion a été perdue, merci de rafraîchir la page.",
        },

        tooltips: {
            home: {
                add_world: "Créer un monde",
                add_board: "Créer un tableau",
                manage_board: "Paramétrer le tableau",
                delete_board: "Supprimer le tableau",
                parameters_world: "Paramètres du monde",
                parameters_board: "Paramètres du tableau",
            },

            board: {
                foreground: "Premier plan",
                background: "Arrière-plan",
            },

            overlay_alert: {
                reload_button: "Rafraîchir la page.",
            },
        },
        alert: {
            xlsx: {
                truncate: {
                    title: "Avertissement copie partielle",
                    description:
                        "Seules les {MAXROWS} x {MAXCELLS} premières cellules de votre tableau ont été collées",
                },
            },
        },
        terms: {
            title: "Cookies or not Cookies ?",
            descriptionHTML:
                '<p>Bienvenue sur Visual World,</p><p> Pour que vous puissiez en profiter nous devons installer des cookies, ils nous aident à gérer votre connexion sécurisée et vos préférences mais sachez que :</p><ul style="text-align:left;width:fit-content;margin:auto;"><li>Nous n’installons que les cookies nécessaires au bon fonctionnement de l’application.</li><li>Nous ne partageons pas les cookies avec des tiers. C’est uniquement entre vous et nous.</li></ul><p>Si vous avez des questions ou demandes n’hésitez pas à nous joindre sur <a href="mailto:{supportMail}">{supportMail}</a></p><p>Alors, cookies or not cookies ?</p>',
            declin: {
                title: "Non merci",
                description:
                    "Je comprends que je ne pourrai pas accéder à Visual World, mais je ne souhaite pas de cookies.",
            },
            accept: {
                title: "J'accepte",
                description:
                    "Les cookies nécessaires au bon fonctionnement de Visual World.",
            },
        },
        buy_world: {
            btn: "Acheter un monde",
        },
        loading: "Chargement en cours...",
        jira: {
            jql_format_placeholder: "jql Format",
            project_sync_placeholder: "Choisissez les projects a synchroniser",
            reset_sync:
                "Êtes-vous sûr de vouloir réinitialiser les paramètres ?",
            confirm_reset: "Oui",
            cancel_reset: "Non",
            reset_button: "Réinitialiser",
            validate: "Valider",
            host: "URL",
            username: "Identifiant",
            api_token: "Jeton d'API",
            url_error: "Champ requis",
            wrong_url: "Format d'URL incorrect",
            username_error: "Champ requis",
            password_error: "Champ requis",
            api_error: "Jira API Error",
            refresh: "Rafraîchir",
            // issuelinks: {
            //     Blocks: 'Blocks',
            //     Clones: 'Clones',
            //     Duplicate: 'Duplicate',
            //     Reviews: 'Reviews',
            //     Causes: 'Causes',
            //     Relates: 'Relates'
            // }
        },
        user_profile: {
            edit_profile: "Modifier le profil",
            personal_information: "Paramètres utilisateur",
            locale: "Language",
            email: "E-mail",
            firstname: "Nom",
            lastname: "Prénom",
            edit: "Modifier",
            cancel: "Annuler",
            required_firstname: "Le nom est requis",
            required_lastname: "Le prénom est requis",
            required_locale: "Champ requis",
            forgot_password: "Changer le mot de passe",
            error: "Une erreur est survenue lors de la communication avec le serveur",
        },
    },
};
