'use strict';

import { ILoadedTestsResult } from './loaded-tests-result';

export interface ICargoTestListParser {
    parseCargoTestListOutput (packageName: string, cargoOutput: string): ILoadedTestsResult;
}
