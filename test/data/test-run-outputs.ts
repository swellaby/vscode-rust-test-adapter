'use strict';

export const mixedTestResults: string = `running 2 tests
test tests::test_add ... ok
test tests::test_bad_add ... FAILED

failures:

---- tests::test_bad_add stdout ----
thread 'tests::test_bad_add' panicked at 'assertion failed: \`(left == right)\`
left: \`0\`,
right: \`1\`', src/lib.rs:26:9
note: Run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace.


failures:
   tests::test_bad_add

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
`;
