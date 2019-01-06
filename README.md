# Rust VS Code Test Explorer
Rust Test Explorer for VS Code that enables viewing and running your Rust tests from the VS Code Sidebar. 

***************************************
**Functional, but still in an early Beta/Preview !!!!**  
**Bugs are an inevitable** 😁
***************************************

See the [Test Explorer UI Extension](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer) for more details on what this will look like when completed.

## Current Features
Detected unit tests will be viewable and runnable from the Test Explorer window as long as there is a Cargo.toml file in the root of the directory. It should also work with Cargo Workspaces, as well as packages that have both bin and lib targets. 

The tree will reflect the `package -> target -> module -> ...` hierarchical structure. However, the tree will flatten the package level if there's only a single package, and/or at the target level if a package only has a single target containing unit tests. 

We've got some sample projects in our [samples repo](https://github.com/swellaby/rust-test-samples) for various scenarios.

## Roadmap
The initial focus is the core functionality of viewing and running first unit tests.

Afterwards we're tentatively planning to make the individual test results available in the tree (i.e. when you click on failed test case node in the tree, test output will be viewable in VS Code Output Window), followed by documentation tests and integration tests.

More info can be found in the [GitHub Project](https://github.com/swellaby/vscode-rust-test-adapter/projects/1)

## License
MIT - see license details [here][license-url] 

[license-url]: https://github.com/swellaby/vscode-rust-test-adapter/blob/master/LICENSE
