const source = {
  opSpec: (
`type OpSpec struct {
	Opcode  byte
	Name    string
	op      evalFunc   // evaluate the op
	asm     asmFunc    // assemble the op
	dis     disFunc    // disassemble the op
	Args    StackTypes // what gets popped from the stack
	Returns StackTypes // what gets pushed to the stack
	Version uint64     // TEAL version opcode introduced
	Modes   runMode    // if non-zero, then (mode & Modes) != 0 to allow
	Details opDetails  // Special cost or bytecode layout considerations
}`
  ),
  opSpecInstance: (
`{
	0xb0,
	"log",
	opLog,
	asmDefault,
	disDefault,
	oneBytes,
	nil,
	5,
	runModeApplication,
	opDefault
}`
  )
};

function TEAL(props) {
  return (
    <>
      <h1 className="title">TEAL</h1>
      <h2 className="subtitle">A place to learn more about how TEAL works</h2>
      <div className="content">
        <p>
          The TEAL language has
          {' '}
          <a href="https://github.com/algorand/go-algorand/blob/21b4bc5394c5e193b47b8da4fa69b7f55e148b03/data/transactions/logic/teal.tmLanguage.json" target="_blank" rel="noreferrer">
            VS Code syntax highlighting
          </a>
          {' '}
          which uses
          {' '}
          <a href="https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide" target="_blank" rel="noreferrer">
            TextMate grammars
          </a>
          .
        </p>
        <p>
          TEAL Opcodes are defined using the `OpSpec` struct.
        </p>
        <pre>
          {source.opSpec}
        </pre>
        <p>
          An example instance of `OpSpec` - the `log` opcode.
        </p>
        <pre>
          {source.opSpecInstance}
        </pre>
      </div>
    </>
  );
}

export {TEAL};