

function Owner() {
    return (
        <div className="mt-16 min-h-screen bg-gray-50 flex flex-col items-center">
            <div className="">Owner</div>
            
            {}
            <div className="mt-8 grid grid-cols-3 gap-8">
                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V7h8v2z"/>
                </svg>

                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M3 3v17a1 1 0 0 0 1 1h17"/>
                    <path d="M19 17V9M15 17V5M11 17v-7M7 17v-4"/>
                </svg>

                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            </div>
        </div>
    );
}

export default Owner;
