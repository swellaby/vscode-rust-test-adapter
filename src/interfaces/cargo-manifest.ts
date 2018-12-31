'use strict';

export interface ICargoManifest {
    workspace?: {
        members: string[];
    };
    cargoPackage: {
        name: string;
    };
}
