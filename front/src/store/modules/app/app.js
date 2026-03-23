import ObjectsOnBoard from "./objects-in-board";
import ComponentEdit from "./component-edit";
import LibrariesOfUniverse from "./libraries-of-universe";
import WorldsOfUniverse from "./worlds-of-universe";

export default {
    namespaced: true,

    modules: {
        objectsInBoard: ObjectsOnBoard,
        componentEdit: ComponentEdit,
        librariesOfUniverse: LibrariesOfUniverse,
        worldsOfUniverse: WorldsOfUniverse,
    },
};
