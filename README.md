# tododay

<img src="assets/splash.webp" alt="tododay" />

## What is tododay?

tododay is designed with the following principles in mind:

- Checking off a todo is satisfying
- Completing a list of todos is satisfying
- Starting each day with a clear plan is productive

<img src="assets/usage-diagram.svg" alt="usage" />

## Installation

At the moment this project is compile-from-source only :raised_hands:

## Development

Make sure [rust](https://www.rust-lang.org/) and [cargo](https://doc.rust-lang.org/cargo/) are installed - ([installation guide](https://doc.rust-lang.org/cargo/getting-started/installation.html))

Using [cargo](https://doc.rust-lang.org/cargo/), install the [tauri cli](https://crates.io/crates/tauri-cli)

```bash
cargo install tauri-cli
```

To run the development server (includes hot reloading on file changes):

```bash
cargo tauri dev
```

To package and install the application:

```bash
cargo tauri build
```
