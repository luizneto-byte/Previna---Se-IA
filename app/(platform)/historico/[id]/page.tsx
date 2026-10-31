import Chat from '@/components/Chat';export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <><h1>Conversa anterior</h1><Chat initialId={id}/></>}
