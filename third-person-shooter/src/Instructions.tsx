


export default function Instructions() {

    const isMac = navigator.userAgent.indexOf('Mac OS X') != -1
    const ctrlSymbol = isMac ? '⌘' : 'Ctrl' 
    return (
        <div className="panel" style={{
            color: '#ffffff',
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            borderRadius: '10px',
            backgroundColor: '#3A3A3A',
            textAlign: 'left',
            padding: '15px 15px 15px 15px',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridGap: '20px',
                lineHeight: '2rem'
            }}>
                <div style={{
                    lineHeight: '2.1rem'
                }}>
                    <div>Start</div>
                    <div>Move</div>
                    <div>Shoot</div>
                    <div>Jump</div>
                    <div>Sprint</div>
                    <div>Show cursor</div>
                    <div>Restart</div>
                </div>
                <div>
                    <div>
                        <div className="keymap">LMB</div>
                    </div>
                    <div>
                        <div className="keymap">W</div>
                        <div className="keymap">A</div>
                        <div className="keymap">S</div>
                        <div className="keymap">D</div>
                    </div>
                    <div><div className="keymap">LMB</div></div>
                    <div><div className="keymap">Space</div></div>
                    <div><div className="keymap">Shift</div></div>
                    <div>
                     <div className="keymap">Esc</div>
                    </div>
                    <div><div className="keymap">{ctrlSymbol} + R</div></div>
                </div>

            </div>
        </div>
    )
}