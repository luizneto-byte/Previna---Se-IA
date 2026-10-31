import type { Metadata } from 'next';
import './style.css';
export const metadata:Metadata={title:'ISA | Previna-se',description:'Converse com a ISA por texto ou voz'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
