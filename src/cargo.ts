'use strict';

import { ExecOptions, exec } from 'child_process';
import { Log } from 'vscode-test-adapter-util';
import { ICargoMetadata } from './interfaces/cargo-metadata';
import { ICargoTestListResult } from './interfaces/cargo-test-list-result';
import { ICargoPackage } from './interfaces/cargo-package';
import { ICargoPackageTarget } from './interfaces/cargo-package-target';
import { TargetType } from './enums/target-type';

// https://doc.rust-lang.org/reference/linkage.html
// Other types of various lib targets that may be listed in the Cargo metadata.
// However, we still need to use --lib for both test detection and execution with all of these.
// See https://github.com/swellaby/vscode-rust-test-adapter/issues/34
const libTargetTypes = [ 'staticlib', 'dylib', 'cdylib', 'rlib' ];

export const runCargoCommand = async (
    subCommand: string,
    args: string,
    targetWorkspace: string,
    maxBuffer: number,
    allowStderr: boolean = false
) => new Promise<string>((resolve, reject) => {
    const cmd = `cargo ${subCommand} ${args}`;
    const execArgs: ExecOptions = {
        cwd: targetWorkspace,
        maxBuffer
    };
    exec(cmd, execArgs, (err, stdout, stderr) => {
        if (err) {
            if (!allowStderr) {
                return reject(err);
            } else if (!stderr) {
                return reject(err);
            }
        }
        resolve(stdout);
    });
});

export const getCargoMetadata = async (
    targetWorkspace: string,
    log: Log,
    maxBuffer: number = 300 * 1024
) => new Promise<ICargoMetadata>(async (resolve, reject) => {
    const cargoSubCommand = 'metadata';
    const args = '--no-deps --format-version 1';
    try {
        const stdout = await runCargoCommand(cargoSubCommand, args, targetWorkspace, maxBuffer);
        const cargoMetadata: ICargoMetadata = JSON.parse(stdout);
        resolve(cargoMetadata);
    } catch (err) {
        log.debug(err);
        reject(new Error('Unable to parse cargo metadata output'));
    }
});

export const getCargoTestListOutput = async (
    targetWorkspace: string,
    log: Log,
    testArgs: string = '',
    maxBuffer: number = 400 * 1024
) => new Promise<string>(async (resolve, reject) => {
    const cargoSubCommand = 'test';
    const args = `${testArgs} -- --list`;
    try {
        const stdout = await runCargoCommand(cargoSubCommand, args, targetWorkspace, maxBuffer);
        resolve(stdout);
    } catch (err) {
        log.debug(err);
        reject(new Error('Unable to retrieve enumeration of tests'));
    }
});

export const getCargoTargetOption = (target: ICargoPackageTarget) => {
    let targetKind = TargetType[target.kind[0]];
    const targetName = target.name;
    let targetOption = '';
    if (targetKind === TargetType.bin) {
        targetOption = `--bin ${targetName}`;
    } else if (targetKind === TargetType.lib) {
        targetOption = '--lib';
    } else if (libTargetTypes.includes(target.kind[0])) {
        targetOption = '--lib';
        targetKind = TargetType.lib;
    } else {
        throw new Error(`Unsupported target type: ${targetName}`);
    }

    return {
        targetOption,
        targetKind,
        targetName
    };
};

export const getCargoTestListForPackage = async (cargoPackage: ICargoPackage, log: Log) => new Promise<ICargoTestListResult[]>(async (resolve, reject) => {
    if (!cargoPackage) {
        reject(new Error('Invalid value specified parameter `cargoPackage`. Unable to load tests for null/undefined package.'));
    }
    const { manifest_path: manifestPath, name: packageName, targets } = cargoPackage;
    try {
        const packageRootDirectory = manifestPath.endsWith('Cargo.toml') ? manifestPath.slice(0, -10) : manifestPath;
        const cargoTestListResults = await Promise.all(targets.map(async target => {
            let cargoTestArgs = `-p ${packageName}`;
            const { targetOption, targetKind, targetName } = getCargoTargetOption(target);
            cargoTestArgs += ` ${targetOption}`;
            const output = await getCargoTestListOutput(packageRootDirectory, log, cargoTestArgs);
            return <ICargoTestListResult>{ output, nodeTarget: { targetType: targetKind, targetName } };
        }));
        resolve(cargoTestListResults);
    } catch (err) {
        log.debug(err);
        reject(new Error(`Failed to load tests for package: ${packageName}.`));
    }
});
