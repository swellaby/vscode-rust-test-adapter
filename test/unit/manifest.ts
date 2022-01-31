'use strict';

import { assert } from 'chai';
import * as manifest from '../../package.json';

suite('Metadata Tests:', () => {
    test('Should have the correct name', () => {
        assert.deepEqual(manifest.name, 'vscode-rust-test-adapter');
    });

    test('Should have the correct display name', () => {
        assert.deepEqual(manifest.displayName, 'Rust Test Explorer');
    });

    test('Should have the correct publisher', () => {
        assert.deepEqual(manifest.publisher, 'Swellaby');
    });

    test('Should have correct extension categories', () => {
        assert.isTrue(manifest.categories.includes('Testing'));
    });

    test('Should have correct keywords', () => {
        assert.isTrue(manifest.keywords.includes('rust'));
        assert.isTrue(manifest.keywords.includes('rustlang'));
        assert.isTrue(manifest.keywords.includes('test'));
        assert.isTrue(manifest.keywords.includes('testing'));
        assert.isTrue(manifest.keywords.includes('test adapter'));
        assert.isTrue(manifest.keywords.includes('test explorer'));
    });

    test('Should have the correct icon', () => {
        assert.deepEqual(manifest.icon, 'images/rust3.png');
    });

    test('Should have correct VS Code engine', () => {
        assert.deepEqual(manifest.engines.vscode, '^1.34.0');
    });
});
