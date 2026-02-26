import { type ChangeEvent, type FC, useRef } from 'react';

interface Props {
    onImport: (file: File) => void;
}

const ImportCsvButton: FC<Props> = ({ onImport }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onImport(file);
        e.target.value = '';
    };

    return (
        <>
            <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Import CSV
            </button>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
        </>
    );
};

export default ImportCsvButton;
