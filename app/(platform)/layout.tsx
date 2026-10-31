import {session} from '@/lib/auth';
import {redirect} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Logout from '@/components/Logout';
export default async function Layout({children}:{children:React.ReactNode}){const me=await session();if(!me)redirect('/login');return <div className="workspace"><aside className="sidebar"><Link className="brand brand-with-logo" href="/dashboard"><Image src="/logo-previna.png" alt="Previna-se" width={46} height={46}/><span>PREVINA-SE <em>IA</em></span></Link><div className="sidebar-label">ÁREA DE TRABALHO</div><Link href="/dashboard">⌂ &nbsp; Painel</Link><Link href="/chat">✦ &nbsp; Conversar com ISA</Link><Link href="/normas">▤ &nbsp; Biblioteca de NRs</Link><Link href="/historico">◷ &nbsp; Histórico</Link>{me.role==='admin'&&<Link href="/admin">⚙ &nbsp; Administração</Link>}<div className="sidebar-footer"><div style={{fontSize:12,color:'#d0e8de',overflowWrap:'anywhere'}}>{me.name}<br/>{me.email}</div><Logout/></div></aside><main className="main">{children}</main></div>}
