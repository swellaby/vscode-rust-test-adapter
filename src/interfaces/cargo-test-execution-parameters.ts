'use strict';

import { Log } from 'vscode-test-adapter-util';
import { INodeTarget } from './node-target';

/**
 * Describes the parameters to use for execution of tests with Cargo.
 */
export interface ICargoTestExecutionParameters {
    targetWorkspace: string,
    packageName: string,
    nodeTarget: INodeTarget,
    log: Log
    cargoSubCommandArgs?: string,
    testBinaryArgs?: string,
}
