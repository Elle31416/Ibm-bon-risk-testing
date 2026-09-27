import test from 'ava';
import {Chalk} from '../source/index.js';

// The `ansi256`/`bgAnsi256` model builders are the only uncovered statements
// in source/index.js: `getModelAnsi`'s generic fallback
// (`return ansiStyles[type][model](...arguments_)`, line 91) is only reached
// by a model that is neither `rgb` nor `hex`, and the upstream test suite —
// carried over verbatim in this repository — never invokes the ansi256 model
// (it only exercises `rgb()` and `hex()`), so that line had 0 hits at the
// prepared-repo baseline and at every measurement since.
test('ansi256 model renders a 256-color foreground sequence', t => {
	const chalk = new Chalk({level: 3});
	t.is(chalk.ansi256(30)('foo'), '\u001B[38;5;30mfoo\u001B[39m');
});

test('bgAnsi256 model renders a 256-color background sequence', t => {
	const chalk = new Chalk({level: 3});
	t.is(chalk.bgAnsi256(208)('bar'), '\u001B[48;5;208mbar\u001B[49m');
});

test('ansi256 model composes with modifier styles in the right close order', t => {
	const chalk = new Chalk({level: 3});
	t.is(chalk.bold.ansi256(30)('baz'), '\u001B[1m\u001B[38;5;30mbaz\u001B[39m\u001B[22m');
});

test('ansi256 model emits plain text when color support is level 0', t => {
	const chalk = new Chalk({level: 0});
	t.is(chalk.ansi256(30)('foo'), 'foo');
});
