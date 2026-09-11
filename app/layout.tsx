import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Chenke Huang — Portfolio',description:'产品与交互设计作品集。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
