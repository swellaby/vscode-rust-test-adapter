# Rust VS Code Test Explorer
Rust Test Explorer for VS Code that enables viewing and running your Rust tests from the VS Code Sidebar. 

***************************************
**Functional, but still in an early Beta/Preview !!!!**  
**Bugs are inevitable** 😁
***************************************

[![Version Badge][version-badge]][ext-url]
[![Installs Badge][installs-badge]][ext-url]
[![Rating Badge][rating-badge]][ext-url]
[![License Badge][license-badge]][license-url]  

[![Linux CI Badge][linux-ci-badge]][linux-ci-url]
[![Mac CI Badge][mac-ci-badge]][mac-ci-url]
[![Windows CI Badge][windows-ci-badge]][windows-ci-url]  

[![Test Results Badge][tests-badge]][tests-url]
[![Coverage Badge][coverage-badge]][coverage-url]
[![Sonar Quality GateBadge][quality-gate-badge]][sonar-project-url]  

![Screenshot][screenshot-url]

See the [Test Explorer UI Extension][test-explorer-extension-url] for additional information.

## Current Features
Detected unit tests will be viewable and runnable from the Test Explorer window as long as there is a Cargo.toml file in the root of the directory. It should also work with Cargo Workspaces, as well as packages that have both bin and lib targets. 

The tree will reflect the `package -> target -> module -> ...` hierarchical structure. However, the tree will flatten the package level if there's only a single package, and/or at the target level if a package only has a single target containing unit tests. 

We've got some sample projects in our [samples repo](https://github.com/swellaby/rust-test-samples) for various scenarios.

## Roadmap
The initial focus is the core functionality of viewing and running first unit tests.

Afterwards we're tentatively planning to make the individual test results available in the tree (i.e. when you click on failed test case node in the tree, test output will be viewable in VS Code Output Window). Next, we want to support discovering and running integration tests and documentation tests.

More info can be found in the [GitHub Project](https://github.com/swellaby/vscode-rust-test-adapter/projects/1)

## Other Projects
Here's some of our other Rust-related projects you may want to check out!

* [rusty-hook][rusty-hook-crate-url] - A git hook utility for your Rust projects
* [VS Code Rust Extension Pack][vscode-rust-pack-extension-url] - A minimalist extension pack for Rust development in VS Code

## License
MIT - see license details [here][license-url] 


[installs-badge]: https://img.shields.io/vscode-marketplace/i/swellaby.vscode-rust-test-adapter.svg?style=flat-square
[version-badge]: https://img.shields.io/vscode-marketplace/v/swellaby.vscode-rust-test-adapter.svg?style=flat-square&label=marketplace
[rating-badge]: https://img.shields.io/vscode-marketplace/r/swellaby.vscode-rust-test-adapter.svg?style=flat-square
[ext-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.vscode-rust-test-adapter
[license-url]: https://github.com/swellaby/vscode-rust-test-adapter/blob/master/LICENSE
[license-badge]: https://img.shields.io/github/license/swellaby/vscode-rust-test-adapter?style=flat-square&color=blue
[linux-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/69/master?label=linux%20build&style=flat-square
[linux-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=69
[mac-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/98/master?label=mac%20build&style=flat-square
[mac-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=98
[windows-ci-badge]: https://img.shields.io/azure-devops/build/swellaby/opensource/99/master?label=windows%20build&style=flat-square
[windows-ci-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=99
[coverage-badge]: https://img.shields.io/azure-devops/coverage/swellaby/opensource/98/master?style=flat-square
[coverage-url]: https://codecov.io/gh/swellaby/vscode-rust-test-adapter
[tests-badge]: https://img.shields.io/azure-devops/tests/swellaby/opensource/98/master?label=unit%20tests&style=flat-square
[tests-url]: https://dev.azure.com/swellaby/OpenSource/_build/latest?definitionId=98&view=ms.vss-test-web.build-test-results-tab
[quality-gate-badge]: https://img.shields.io/sonar/quality_gate/swellaby:vscode-rust-test-adapter?server=https%3A%2F%2Fsonarcloud.io&style=flat-square
[sonar-project-url]: https://sonarcloud.io/dashboard?id=swellaby%3Avscode-rust-test-adapter
[screenshot-url]: https://user-images.githubusercontent.com/13042488/66226127-b1e0d080-e69f-11e9-82da-0a6cf83ff1fd.png
[test-explorer-extension-url]: https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer
[rusty-hook-crate-url]: https://crates.io/crates/rusty-hook
[vscode-rust-pack-extension-url]: https://marketplace.visualstudio.com/items?itemName=swellaby.rust-pack
