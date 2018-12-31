'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
import { Log } from 'vscode-test-adapter-util';
import { RustAdapter } from '../../src/rust-adapter';

suite('RustAdapter Tests:', () => {
    let logInfoStub: Sinon.SinonStub;
    let logStub: Log;
    let rustAdapter: RustAdapter;

    setup(() => {
        logStub = <Log>{ info: (message: string) => null };
        logInfoStub = Sinon.stub(logStub, 'info');
        rustAdapter = new RustAdapter('foo', logStub, null, null, null);
    });

    teardown(() => {
        Sinon.restore();
    });

    test('Should display correct initialization method', async () => {
        assert.isTrue(logInfoStub.firstCall.calledWithExactly('Initializing Rust adapter'));
    });
});
