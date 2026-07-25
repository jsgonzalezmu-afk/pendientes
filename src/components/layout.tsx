import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Briefcase, FileText, Activity, Download, Menu } from 'lucide-react';
import { exportAllToExcel } from '@/lib/export';

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Procesos', icon: Briefcase },
    { href: '/asesorias', label: 'Asesorías', icon: FileText },
    { href: '/seguimientos', label: 'Seguimientos', icon: Activity },
  ];

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportAllToExcel();
    } catch (e) {
      console.error(e);
      alert('Error al exportar. Intente de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <h1 className="text-xl font-bold tracking-tight">Despacho Legal</h1>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          {navItems.map(item => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border shrink-0">
          <button 
            onClick={handleExportAll}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Descargar Todo'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b bg-card sticky top-0 z-30">
          <h1 className="text-lg font-bold text-foreground">Despacho Legal</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -mr-2 cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile menu overlay */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
              <h1 className="text-lg font-bold">Menú</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 cursor-pointer">
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-md bg-accent text-accent-foreground font-medium">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={() => { handleExportAll(); setIsSidebarOpen(false); }}
                className="mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-primary text-primary-foreground font-medium cursor-pointer"
              >
                <Download className="h-5 w-5" />
                Descargar Todo
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
