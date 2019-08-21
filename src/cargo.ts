'use strict';

import { ExecOptions, exec } from 'child_process';
import { Log } from 'vscode-test-adapter-util';
import { ICargoMetadata } from './interfaces/cargo-metadata';
import { ICargoTestListResult } from './interfaces/cargo-test-list-result';

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
